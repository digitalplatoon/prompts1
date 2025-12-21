import { useState } from 'react';
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/prompts';
import { SearchAutocomplete } from './SearchAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  onSortChange?: (sort: SortOption) => void;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  minRating: number;
}

export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating-high' | 'rating-low';

export function SearchFilters({ onSearch, onFilterChange, onSortChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 50],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange?.(value);
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
      {/* Search Bar with Autocomplete */}
      <div className="relative mb-4 flex gap-2">
        <div className="flex-1">
          <SearchAutocomplete onSearch={onSearch} />
        </div>
        
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px] h-12 bg-background border-border">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating-high">Rating: High to Low</SelectItem>
            <SelectItem value="rating-low">Rating: Low to High</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 h-12 w-12"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

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
