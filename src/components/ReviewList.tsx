import { Star, User } from 'lucide-react';
import { Review } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  currentUserId?: string;
}

export function ReviewList({ reviews, loading, currentUserId }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-20 h-3 bg-muted rounded" />
              </div>
            </div>
            <div className="w-full h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Filter out current user's review (shown separately in ReviewForm)
  const otherReviews = reviews.filter(r => r.user_id !== currentUserId);

  if (otherReviews.length === 0 && currentUserId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No other reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {otherReviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-border/50 pb-6 last:border-0 last:pb-0"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">
                {review.profile?.display_name || 'Anonymous'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-3 h-3",
                        star <= review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
