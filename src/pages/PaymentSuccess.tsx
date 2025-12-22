import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { prompts } from '@/data/prompts';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<{
    promptId: string;
    promptTitle: string;
    price: number;
  } | null>(null);

  const sessionId = searchParams.get('session_id');
  const promptId = searchParams.get('prompt_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !promptId || !user) {
        setVerifying(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await supabase.functions.invoke('verify-prompt-payment', {
          body: { sessionId, promptId },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (response.data?.verified) {
          setVerified(true);
          const prompt = prompts.find(p => p.id === promptId);
          if (prompt) {
            setPurchaseDetails({
              promptId: prompt.id,
              promptTitle: prompt.title,
              price: prompt.price,
            });
          }
        } else {
          toast({
            title: 'Verification failed',
            description: 'Unable to verify your payment. Please contact support.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: 'Verification error',
          description: 'Something went wrong. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, promptId, user, toast]);

  // Redirect if no session_id
  useEffect(() => {
    if (!sessionId) {
      navigate('/browse');
    }
  }, [sessionId, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Payment Successful"
          description="Your payment has been processed successfully. Access your purchased prompt from your library."
          noindex={true}
        />
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying your payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Payment Successful"
        description="Your payment has been processed successfully. Access your purchased prompt from your library."
        noindex={true}
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {verified ? (
              <>
                {/* Success Animation */}
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-fade-in">
                    <CheckCircle className="w-14 h-14 text-emerald-500" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                  <p className="text-lg text-muted-foreground">
                    Thank you for your purchase. Your prompt is now available in your library.
                  </p>
                </div>

                {/* Purchase Details Card */}
                {purchaseDetails && (
                  <div className="card-glass mb-8">
                    <h2 className="text-xl font-semibold mb-4">Purchase Details</h2>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Item</span>
                        <span className="font-medium">{purchaseDetails.promptTitle}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium text-primary">${purchaseDetails.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Status</span>
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/my-prompts">
                    <Button className="btn-gradient glow w-full sm:w-auto px-8 py-6 text-lg">
                      <Package className="w-5 h-5 mr-2" />
                      Go to My Library
                    </Button>
                  </Link>
                  {purchaseDetails && (
                    <Link to={`/prompt/${purchaseDetails.promptId}`}>
                      <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg">
                        View Prompt
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                  <h3 className="font-semibold mb-2">What's next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Access your full prompt anytime from your library
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Copy and use the prompt in your favorite AI tools
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Get free updates when the prompt is improved
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Error State */}
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-6">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Verification Failed</h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    We couldn't verify your payment. If you believe this is an error, please contact support.
                  </p>
                  <Link to="/browse">
                    <Button className="btn-gradient">Browse Prompts</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
