import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-H9XLN5SK36';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GoogleAnalytics = () => {
  const location = useLocation();

  // Initialize GA4 script
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
      return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;
    if (typeof window.gtag !== 'function') return;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  // Listen for cookie consent changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookie-consent' && e.newValue === 'accepted') {
        // Reload to initialize analytics
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
};

export default GoogleAnalytics;
