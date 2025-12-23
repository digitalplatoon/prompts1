import { useState } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email address');

export function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: email.trim() }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        // Handle rate limiting
        if (data.retryAfter) {
          toast({
            title: 'Too many attempts',
            description: `Please wait ${data.retryAfter} seconds before trying again.`,
            variant: 'destructive',
          });
          return;
        }
        throw new Error(data.error);
      }

      if (data?.alreadySubscribed) {
        toast({
          title: 'Already subscribed',
          description: 'This email is already on our mailing list.',
        });
        setSubscribed(true);
        return;
      }

      setSubscribed(true);
      toast({
        title: 'Successfully subscribed!',
        description: 'Thank you for joining our newsletter.',
      });
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      toast({
        title: 'Subscription failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} className="btn-gradient">
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
