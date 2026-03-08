import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

interface Suggestion {
  type: 'prompt' | 'tag' | 'category';
  value: string;
  label: string;
  promptId?: string;
}

export function SearchAutocomplete({ onSearch, placeholder = "Search prompts..." }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allPrompts, setAllPrompts] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  // Load prompts from database on mount
  useEffect(() => {
    const loadPrompts = async () => {
      const { data } = await supabase
        .from('prompts')
        .select('id, title, tags')
        .eq('status', 'published');
      if (data) setAllPrompts(data);
    };
    loadPrompts();
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const results: Suggestion[] = [];
    const seen = new Set<string>();

    // Search prompt titles
    allPrompts.forEach((prompt) => {
      if (prompt.title.toLowerCase().includes(searchTerm)) {
        const key = `prompt-${prompt.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            type: 'prompt',
            value: prompt.title,
            label: prompt.title,
            promptId: prompt.id,
          });
        }
      }
    });

    // Search tags
    allPrompts.forEach((prompt) => {
      if (prompt.tags) {
        prompt.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(searchTerm)) {
            const key = `tag-${tag}`;
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                type: 'tag',
                value: tag,
                label: `#${tag}`,
              });
            }
          }
        });
      }
    });

    // Limit results
    return results.slice(0, 8);
  }, [query, allPrompts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setHighlightedIndex(-1);
    
    // Live search as user types
    onSearch(value);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'prompt' && suggestion.promptId) {
      navigate(`/prompt/${suggestion.promptId}`);
    } else {
      setQuery(suggestion.value);
      onSearch(suggestion.value);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else {
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="input-glass w-full pl-12 pr-10"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors
                ${highlightedIndex === index ? 'bg-accent' : 'hover:bg-accent/50'}
              `}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              {suggestion.type === 'prompt' && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Prompt
                </span>
              )}
              {suggestion.type === 'tag' && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                  Tag
                </span>
              )}
              <span className="flex-1 truncate">{suggestion.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
