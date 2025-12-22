import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { prompts, categories } from '@/data/prompts';
import { Star, ArrowLeft, Copy, ShoppingCart, CheckCircle, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList } from '@/components/ReviewList';
import { useReviews } from '@/hooks/useReviews';

const PromptDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prompt = prompts.find((p) => p.id === id);
  const category = categories.find((c) => c.id === prompt?.category);
  const [copied, setCopied] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle payment success verification
  useEffect(() => {
    const verifyPayment = async () => {
      const paymentStatus = searchParams.get('payment');
      const sessionId = searchParams.get('session_id');
      
      if (paymentStatus === 'success' && sessionId && user && id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const response = await supabase.functions.invoke('verify-prompt-payment', {
            body: { sessionId, promptId: id },
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });
          
          if (response.data?.verified) {
            setIsPurchased(true);
            toast({
              title: 'Purchase successful!',
              description: `${prompt?.title} has been added to your library.`,
            });
            // Clean up URL params
            navigate(`/prompt/${id}`, { replace: true });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }
    };
    
    verifyPayment();
  }, [searchParams, user, id, prompt?.title, toast, navigate]);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user || !id) {
        setCheckingPurchase(false);
        return;
      }

      const { data } = await supabase
        .from('purchased_prompts')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', id)
        .maybeSingle();

      setIsPurchased(!!data);
      setCheckingPurchase(false);
    };

    checkPurchaseStatus();
  }, [user, id]);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Prompt Not Found"
          description="The prompt you're looking for doesn't exist."
          noindex
        />
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Prompt Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The prompt you're looking for doesn't exist.
          </p>
          <Link to="/browse">
            <Button className="btn-gradient">Browse All Prompts</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prompt.title,
    description: prompt.description,
    offers: {
      '@type': 'Offer',
      price: prompt.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: prompt.rating,
      reviewCount: prompt.reviews,
    },
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(prompt.preview);
    setCopied(true);
    toast({
      title: 'Preview Copied!',
      description: 'The prompt preview has been copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFullPrompt = () => {
    navigator.clipboard.writeText(prompt.fullPrompt);
    toast({
      title: 'Full Prompt Copied!',
      description: 'The complete prompt has been copied to your clipboard.',
    });
  };

  const handleBuy = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase prompts.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setPurchasing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-prompt-checkout', {
        body: {
          promptId: prompt.id,
          promptTitle: prompt.title,
          promptPrice: prompt.price,
          promptCategory: category?.name || 'General',
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setPurchasing(false);
    }
  };

  const {
    reviews,
    userReview,
    loading: reviewsLoading,
    submitting: reviewSubmitting,
    submitReview,
    deleteReview,
    averageRating,
    reviewCount,
  } = useReviews(id || '');

  // Use real average rating if we have reviews, otherwise use prompt's default
  const displayRating = reviewCount > 0 ? averageRating : prompt.rating;
  const displayReviewCount = reviewCount > 0 ? reviewCount : prompt.reviews;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={prompt.title}
        description={prompt.description}
        canonical={`https://1prompts.com/prompt/${id}`}
        ogType="product"
        product={{ price: prompt.price, currency: 'USD' }}
        structuredData={productSchema}
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/browse"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="card-glass">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="category-badge">
                      <span className="mr-1.5">{category?.icon}</span>
                      {category?.name}
                    </span>
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
                      <span className="text-sm text-muted-foreground ml-2">
                        {displayRating.toFixed(1)} ({displayReviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FavoriteButton promptId={prompt.id} />
                    <SocialShareButtons title={prompt.title} />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{prompt.title}</h1>
                <p className="text-lg text-muted-foreground">{prompt.description}</p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Prompt Section (only show if purchased) */}
              {isPurchased && (
                <div className="card-glass border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold">Full Prompt</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyFullPrompt}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Full Prompt
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap">
                    {prompt.fullPrompt}
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div className="card-glass">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Prompt Preview</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPreview}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy Preview'}
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm text-muted-foreground">
                  {prompt.preview}
                </div>
                {!isPurchased && (
                  <p className="text-xs text-muted-foreground mt-3">
                    * This is a preview. Purchase to get the full prompt with all variables.
                  </p>
                )}
              </div>

              {/* Usage Instructions */}
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
                <ol className="space-y-3">
                  {prompt.usageInstructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs font-semibold text-primary-foreground flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Example Outputs */}
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-4">Example Outputs</h2>
                <div className="space-y-3">
                  {prompt.exampleOutputs.map((output, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{output}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="card-glass">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Customer Reviews</h2>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(averageRating)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({reviewCount})
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <div className="mb-6">
                  <ReviewForm
                    promptId={id || ''}
                    existingReview={userReview}
                    isPurchased={isPurchased}
                    onSubmit={submitReview}
                    onDelete={deleteReview}
                    submitting={reviewSubmitting}
                  />
                </div>

                {/* Review List */}
                <ReviewList
                  reviews={reviews}
                  loading={reviewsLoading}
                  currentUserId={user?.id}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-glass sticky top-28">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    ${prompt.price}
                  </div>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>

                {checkingPurchase ? (
                  <Button disabled className="w-full mb-4 py-6 text-lg">
                    Checking...
                  </Button>
                ) : isPurchased ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-500/10 text-emerald-500 rounded-xl font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      Owned
                    </div>
                    <Link to="/my-prompts" className="block">
                      <Button variant="outline" className="w-full">
                        <Package className="w-4 h-4 mr-2" />
                        View in Library
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button 
                    onClick={handleBuy} 
                    className="btn-gradient w-full mb-4 py-6 text-lg glow"
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      'Processing...'
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                )}

                <div className="space-y-3 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-muted-foreground">Instant download</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-muted-foreground">Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-muted-foreground">Free updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-muted-foreground">30-day money-back guarantee</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Created by</div>
                      <div className="text-sm text-primary">{prompt.author}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromptDetail;