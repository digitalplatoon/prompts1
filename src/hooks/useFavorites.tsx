import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('prompt_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.prompt_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (promptId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favorites.includes(promptId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== promptId));
        toast({
          title: "Removed from favorites",
          description: "Prompt removed from your wishlist",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, prompt_id: promptId });

        if (error) throw error;
        setFavorites(prev => [...prev, promptId]);
        toast({
          title: "Added to favorites",
          description: "Prompt saved to your wishlist",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (promptId: string) => favorites.includes(promptId);

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
}
