import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/prompts';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  minRating: number;
}

export function SearchFilters({ onSearch, onFilterChange }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 50],
    minRating: 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      category: '',
      priceRange: [0, 50],
      minRating: 0,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search prompts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-glass w-full pl-12 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          <Button type="submit" size="sm" className="btn-gradient px-4">
            Search
          </Button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-glass p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Max Price: ${filters.priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [0, parseInt(e.target.value)])
                }
                className="w-full accent-primary"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Minimum Rating: {filters.minRating}+
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) =>
                  updateFilter('minRating', parseFloat(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
