import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

interface LoginAttempt {
  count: number;
  resetTime: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Rate limiting state - persists across re-renders
  const loginAttemptsRef = useRef<Map<string, LoginAttempt>>(new Map());

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const loginAttempts = loginAttemptsRef.current;
    
    // Check rate limit
    const attempts = loginAttempts.get(normalizedEmail);
    const now = Date.now();
    
    if (attempts) {
      // Reset if window expired
      if (now > attempts.resetTime) {
        loginAttempts.delete(normalizedEmail);
      } else if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const remainingMinutes = Math.ceil((attempts.resetTime - now) / 60000);
        return { 
          error: new Error(`Too many login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`) 
        };
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Track failed attempts
    if (error) {
      const currentAttempts = loginAttempts.get(normalizedEmail) || { 
        count: 0, 
        resetTime: now + RATE_LIMIT_WINDOW_MS 
      };
      
      currentAttempts.count++;
      loginAttempts.set(normalizedEmail, currentAttempts);
    } else {
      // Clear attempts on successful login
      loginAttempts.delete(normalizedEmail);
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
