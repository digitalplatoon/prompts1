import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PromptCard } from '@/components/PromptCard';
import { SearchFilters, FilterState, SortOption } from '@/components/SearchFilters';
import { prompts } from '@/data/prompts';

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    priceRange: [0, 50],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSortedPrompts = useMemo(() => {
    // First filter
    const filtered = prompts.filter((prompt) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          prompt.title.toLowerCase().includes(query) ||
          prompt.description.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && prompt.category !== filters.category) {
        return false;
      }

      // Price filter
      if (prompt.price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (prompt.rating < filters.minRating) {
        return false;
      }

      return true;
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.id.localeCompare(a.id); // Assuming higher ID = newer
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [searchQuery, filters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse <span className="gradient-text">Prompts</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Discover the perfect prompt from our curated collection
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12">
            <SearchFilters
              onSearch={setSearchQuery}
              onFilterChange={setFilters}
              onSortChange={setSortBy}
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredAndSortedPrompts.length}</span> prompts
            </p>
          </div>

          {/* Prompts Grid */}
          {filteredAndSortedPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPrompts.map((prompt, index) => (
                <PromptCard key={prompt.id} prompt={prompt} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
