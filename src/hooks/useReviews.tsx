import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  prompt_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: {
    display_name: string | null;
  };
}

export function useReviews(promptId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [promptId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          prompt_id,
          rating,
          comment,
          created_at,
          profiles:user_id (display_name)
        `)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data?.map(r => ({
        ...r,
        profile: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      })) || [];

      setReviews(formattedReviews);

      // Find user's own review
      if (user) {
        const ownReview = formattedReviews.find(r => r.user_id === user.id);
        setUserReview(ownReview || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a review",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', userReview.id);

        if (error) throw error;

        toast({
          title: "Review updated",
          description: "Your review has been updated successfully",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            prompt_id: promptId,
            rating,
            comment,
          });

        if (error) {
          if (error.code === '23503' || error.message.includes('violates row-level security')) {
            toast({
              title: "Purchase required",
              description: "You can only review prompts you've purchased",
              variant: "destructive",
            });
            return false;
          }
          throw error;
        }

        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      }

      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!userReview) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    reviews,
    userReview,
    loading,
    submitting,
    submitReview,
    deleteReview,
    averageRating,
    reviewCount: reviews.length,
    refetch: fetchReviews,
  };
}
