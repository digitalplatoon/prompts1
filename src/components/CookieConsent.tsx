import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="container mx-auto max-w-4xl">
        <div className="glass rounded-2xl p-6 shadow-2xl border border-border/50">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">We use cookies</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept", you consent to our use of cookies. Read our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for more information.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1 md:flex-none"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 md:flex-none btn-gradient"
              >
                Accept
              </Button>
            </div>

            <button
              onClick={handleDecline}
              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;