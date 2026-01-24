import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { PromptWithCategory } from '@/hooks/usePrompts';

interface PromptCardProps {
  prompt: PromptWithCategory;
  index?: number;
}

export function PromptCard({ prompt, index = 0 }: PromptCardProps) {
  const category = prompt.prompt_categories;
  // Convert price from cents to dollars
  const priceInDollars = (prompt.price_cents / 100).toFixed(2);
  const rating = prompt.average_rating ?? 0;
  const reviewCount = prompt.rating_count ?? 0;

  return (
    <div
      className="card-glass group cursor-pointer relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton promptId={prompt.id} />
      </div>

      <Link to={`/prompt/${prompt.slug}`} className="block">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          {category && (
            <span className="category-badge">
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </span>
          )}
          <span className="price-tag mr-10">${priceInDollars}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>

        {/* Preview */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {prompt.preview}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
          View Details
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
