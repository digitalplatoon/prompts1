import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Prompt, categories } from '@/data/prompts';

interface PromptCardProps {
  prompt: Prompt;
  index?: number;
}

export function PromptCard({ prompt, index = 0 }: PromptCardProps) {
  const category = categories.find(c => c.id === prompt.category);

  return (
    <div
      className="card-glass group cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link to={`/prompt/${prompt.id}`} className="block">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="category-badge">
            <span className="mr-1.5">{category?.icon}</span>
            {category?.name}
          </span>
          <span className="price-tag">${prompt.price}</span>
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
                  i < Math.floor(prompt.rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {prompt.rating} ({prompt.reviews} reviews)
          </span>
        </div>

        {/* Tags */}
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

        {/* CTA */}
        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
          View Details
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
