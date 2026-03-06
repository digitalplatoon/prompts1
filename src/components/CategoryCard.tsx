import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PromptCategory } from '@/hooks/usePrompts';

interface CategoryCardProps {
  category: Pick<PromptCategory, 'id' | 'slug' | 'name' | 'icon' | 'color'>;
  promptCount?: number;
  index?: number;
}

export function CategoryCard({ category, promptCount, index = 0 }: CategoryCardProps) {
  return (
    <Link
      to={`/browse?category=${category.slug}`}
      className="card-glass group text-center"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color || 'from-primary to-primary/70'} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <span className="text-3xl">{category.icon}</span>
      </div>
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>
      {promptCount !== undefined && (
        <p className="text-xs text-muted-foreground mb-2">
          {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
        </p>
      )}
      <div className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
        Explore
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
