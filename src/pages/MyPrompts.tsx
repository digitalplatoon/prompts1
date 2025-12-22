import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { prompts } from '@/data/prompts';
import { Package, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PurchasedPrompt {
  id: string;
  prompt_id: string;
  purchased_at: string;
  price: number;
}

const MyPrompts = () => {
  const { user } = useAuth();
  const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedPrompts = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('purchased_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (!error && data) {
        setPurchasedPrompts(data);
      }
      setLoading(false);
    };

    fetchPurchasedPrompts();
  }, [user]);

  const getPromptDetails = (promptId: string) => {
    return prompts.find(p => p.id === promptId);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Purchased Prompts"
        description="Access your purchased AI prompts library. View and use all the prompts you've bought from 1Prompts."
        noindex={true}
      />
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Prompts</h1>
                <p className="text-muted-foreground">Your purchased prompt library</p>
              </div>
            </div>

            {loading ? (
              <div className="card-glass rounded-2xl p-12 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-muted rounded w-48 mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded w-32 mx-auto" />
                </div>
              </div>
            ) : purchasedPrompts.length === 0 ? (
              <div className="card-glass rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No prompts yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start building your prompt library by browsing our collection
                </p>
                <Link to="/browse">
                  <Button className="btn-gradient">
                    Browse Prompts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {purchasedPrompts.map((purchase) => {
                  const prompt = getPromptDetails(purchase.prompt_id);
                  if (!prompt) return null;

                  return (
                    <div key={purchase.id} className="card-glass rounded-xl p-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="category-badge text-xs">
                              {prompt.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{prompt.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {prompt.description}
                          </p>
                        </div>
                        <Link to={`/prompt/${prompt.id}`}>
                          <Button variant="outline" size="sm" className="shrink-0">
                            View Prompt
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPrompts;
