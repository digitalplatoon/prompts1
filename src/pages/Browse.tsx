import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PromptCard } from '@/components/PromptCard';
import { SEO } from '@/components/SEO';
import { SearchFilters, FilterState, SortOption } from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedPrompts, useCategoryBySlug } from '@/hooks/usePrompts';

const ITEMS_PER_PAGE = 9;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Get category ID from slug for filtering
  const { data: categoryData } = useCategoryBySlug(filters.category || undefined);

  // Calculate order parameters
  const orderBy = useMemo(() => {
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        return 'created_at' as const;
      case 'price-low':
      case 'price-high':
        return 'price_cents' as const;
      case 'rating-high':
      case 'rating-low':
        return 'average_rating' as const;
      default:
        return 'created_at' as const;
    }
  }, [sortBy]);

  const orderAsc = useMemo(() => {
    return sortBy === 'oldest' || sortBy === 'price-low' || sortBy === 'rating-low';
  }, [sortBy]);

  // Fetch prompts from database
  const { data: allPrompts = [], isLoading } = usePublishedPrompts({
    categoryId: categoryData?.id,
    search: searchQuery,
    minPrice: filters.priceRange[0] * 100, // Convert to cents
    maxPrice: filters.priceRange[1] * 100,
    minRating: filters.minRating,
    orderBy,
    orderAsc,
    limit: 100, // Fetch more for client-side pagination
  });

  // Pagination logic (client-side for now to match existing behavior)
  const totalPages = Math.ceil(allPrompts.length / ITEMS_PER_PAGE);
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allPrompts, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Sync category from URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    if (category !== filters.category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Browse AI Prompts - ChatGPT, Claude, Midjourney Templates"
        description="Explore our curated collection of premium AI prompts. Filter by category, price, and rating to find the perfect prompt for ChatGPT, Claude, Midjourney, and more."
        canonical="https://1prompts.com/browse"
      />
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
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              initialCategory={initialCategory}
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">
                {paginatedPrompts.length}
              </span> of <span className="text-foreground font-medium">
                {allPrompts.length}
              </span> prompts
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Prompts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-glass">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : paginatedPrompts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPrompts.map((prompt, index) => (
                  <PromptCard key={prompt.id} prompt={prompt} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current and adjacent pages
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;

                      if (!showPage) {
                        // Show ellipsis
                        if (page === 2 || page === totalPages - 1) {
                          return (
                            <span key={page} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
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
