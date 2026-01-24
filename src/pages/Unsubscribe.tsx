import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const Unsubscribe = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'not_found' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Pre-fill email from URL params or authenticated user
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [searchParams, user]);

  // Auto-check status when email is pre-filled and user is authenticated
  useEffect(() => {
    if (user?.email && email === user.email) {
      checkSubscriptionStatus();
    }
  }, [user, email]);

  const checkSubscriptionStatus = async () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError(null);
    setIsCheckingStatus(true);

    try {
      const { data, error: dbError } = await supabase
        .from('newsletter_subscribers')
        .select('is_active')
        .eq('email', email)
        .maybeSingle();

      if (dbError) {
        // If user isn't authenticated or email doesn't match, they won't have access
        if (dbError.code === '42501') {
          setSubscriptionStatus('not_found');
          setError('Please sign in with this email address to manage your subscription.');
        } else {
          throw dbError;
        }
      } else if (!data) {
        setSubscriptionStatus('not_found');
      } else {
        setSubscriptionStatus(data.is_active ? 'active' : 'inactive');
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('Unable to check subscription status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleUpdateSubscription = async (newStatus: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: newStatus })
        .eq('email', email);

      if (dbError) {
        if (dbError.code === '42501') {
          setError('You must be signed in with this email to update your subscription.');
        } else {
          throw dbError;
        }
      } else {
        setSubscriptionStatus(newStatus ? 'active' : 'inactive');
        toast({
          title: newStatus ? 'Resubscribed!' : 'Unsubscribed',
          description: newStatus 
            ? 'You will now receive our newsletter updates.' 
            : 'You have been unsubscribed from our newsletter.',
        });
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title="Manage Newsletter Subscription"
        description="Manage your newsletter subscription preferences at 1Prompts. Unsubscribe or resubscribe to our newsletter updates."
        canonical="https://1prompts.com/unsubscribe"
        noindex
      />
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Main card */}
        <div className="card-glass p-8 rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            Newsletter Preferences
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Manage your email subscription settings
          </p>

          {/* Email input and check */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscriptionStatus(null);
                    setError(null);
                  }}
                  className="pl-10 input-glass"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {subscriptionStatus === null && (
              <Button
                onClick={checkSubscriptionStatus}
                className="w-full"
                variant="outline"
                disabled={isCheckingStatus || !email}
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Subscription Status'
                )}
              </Button>
            )}

            {/* Status display */}
            {subscriptionStatus === 'active' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">You're subscribed</p>
                    <p className="text-sm text-muted-foreground">You're receiving our newsletter updates.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpdateSubscription(false)}
                  className="w-full"
                  variant="destructive"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </>
                  )}
                </Button>
              </div>
            )}

            {subscriptionStatus === 'inactive' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted border border-border flex items-center gap-3">
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">You're unsubscribed</p>
                    <p className="text-sm text-muted-foreground">You won't receive our newsletter emails.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpdateSubscription(true)}
                  className="w-full btn-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Resubscribe
                    </>
                  )}
                </Button>
              </div>
            )}

            {subscriptionStatus === 'not_found' && !error && (
              <div className="p-4 rounded-lg bg-muted border border-border flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Not subscribed</p>
                  <p className="text-sm text-muted-foreground">This email is not in our newsletter list.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sign in prompt for unauthenticated users */}
          {!user && subscriptionStatus !== null && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                <Link to="/auth" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </Link>
                {' '}to manage your subscription with this email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;