import { useState } from 'react';
import { Star, Send, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Review } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
});

interface ReviewFormProps {
  promptId: string;
  existingReview: Review | null;
  isPurchased: boolean;
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
  onDelete?: () => void;
  submitting: boolean;
}

export function ReviewForm({ 
  existingReview, 
  isPurchased, 
  onSubmit, 
  onDelete,
  submitting 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  if (!user) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Sign in to leave a review
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Purchase this prompt to leave a review
      </div>
    );
  }

  if (existingReview && !isEditing) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Your Review</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= existingReview.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRating(existingReview.rating);
                setComment(existingReview.comment);
                setIsEditing(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">{existingReview.comment}</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setErrors({});
    
    const result = reviewSchema.safeParse({ rating, comment });
    
    if (!result.success) {
      const fieldErrors: { rating?: string; comment?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'rating') fieldErrors.rating = err.message;
        if (err.path[0] === 'comment') fieldErrors.comment = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const success = await onSubmit(rating, comment.trim());
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {existingReview ? 'Update your rating' : 'Your rating'}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive mt-1">{errors.rating}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {existingReview ? 'Update your review' : 'Write your review'}
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this prompt..."
          className="resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.comment ? (
            <p className="text-sm text-destructive">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {comment.length}/500
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-gradient"
        >
          {submitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </Button>
        {existingReview && isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
