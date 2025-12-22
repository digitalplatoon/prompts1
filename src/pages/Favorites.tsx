import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { PromptCard } from '@/components/PromptCard';
import { prompts, Prompt } from '@/data/prompts';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Favorites() {
  const { favorites, loading } = useFavorites();
  const [favoritePrompts, setFavoritePrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const filtered = prompts.filter(p => favorites.includes(p.id));
    setFavoritePrompts(filtered);
  }, [favorites]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Wishlist - Saved AI Prompts"
        description="View your saved AI prompts. Keep track of prompts you're interested in purchasing."
        canonical="https://1prompts.com/favorites"
        noindex
      />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">My Wishlist</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Saved <span className="gradient-text">Prompts</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your curated collection of prompts you're interested in
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : favoritePrompts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No favorites yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and save prompts you're interested in
              </p>
              <Link to="/browse">
                <Button className="btn-gradient">Browse Prompts</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePrompts.map((prompt, index) => (
                <PromptCard key={prompt.id} prompt={prompt} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
