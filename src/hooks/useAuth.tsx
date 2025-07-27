import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback auth provider for when Supabase fails
const createFallbackAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('Service d\'authentification indisponible');

  const signIn = async (email: string, password: string) => {
    setError('Le service d\'authentification est actuellement indisponible. Veuillez réessayer plus tard.');
    return { error: new Error('Service d\'authentification indisponible') };
  };

  const signUp = async (email: string, password: string) => {
    setError('Le service d\'authentification est actuellement indisponible. Veuillez réessayer plus tard.');
    return { error: new Error('Service d\'authentification indisponible') };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    toast({
      title: "Signed out successfully"
    });
  };

  const resetPassword = async (email: string) => {
    setError('Le service de réinitialisation de mot de passe est actuellement indisponible. Veuillez réessayer plus tard.');
    return { error: new Error('Service de réinitialisation de mot de passe indisponible') };
  };

  const clearError = () => setError(null);

  return {
    user,
    session,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Set to false by default for instant UI
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    // Test Supabase connection in the background, do not block UI
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('posts').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase connection test failed:', error);
          setIsSupabaseAvailable(false);
          setError('Database connection issue. Some features may be limited.');
        } else {
          setIsSupabaseAvailable(true);
        }
      } catch (err) {
        console.error('Supabase connection test error:', err);
        setIsSupabaseAvailable(false);
        setError('Database connection issue. Some features may be limited.');
      }
    };
    testSupabaseConnection(); // Run in background

    // Setup auth listener as before (but do not block UI)
    const setupAuthListener = async () => {
      authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      // Initial session check
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };
    setupAuthListener();

    return () => {
      isMounted = false;
      if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseAvailable) {
      setError('Le service d\'authentification est actuellement indisponible. Veuillez réessayer plus tard.');
      return { error: new Error('Service d\'authentification indisponible') };
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de la connexion. Veuillez réessayer.';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Sign in error:', error);
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseAvailable) {
      setError('Le service d\'authentification est actuellement indisponible. Veuillez réessayer plus tard.');
      return { error: new Error('Service d\'authentification indisponible') };
    }

    try {
      setLoading(true);
      setError(null);
      
      const redirectUrl = "https://ufsbd34.fr/";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Sign up error:', error);
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Redirect to home page after sign out
      window.location.href = '/';
      
      toast({
        title: "Signed out successfully"
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de la déconnexion. Veuillez réessayer.';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Sign out error:', error);
      }
      toast({
        title: "Erreur lors de la déconnexion",
        description: "Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseAvailable) {
      setError('Le service de réinitialisation de mot de passe est actuellement indisponible. Veuillez réessayer plus tard.');
      return { error: new Error('Service de réinitialisation de mot de passe indisponible') };
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📧 Sending password reset email via Supabase...');
      
      // Add timeout to prevent browser hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
      );
      
      // Use Supabase's built-in password reset with timeout
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      const { error } = await Promise.race([resetPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('📧 Password reset error:', error);
        setError('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.');
        return { error };
      }
      
      console.log('📧 Password reset email sent successfully!');
      toast({
        title: "Email de réinitialisation envoyé !",
        description: "Veuillez vérifier votre boîte mail (et dossier spam) pour les instructions de réinitialisation du mot de passe.",
        variant: "default"
      });
      
      return { error: null };
      
    } catch (error: any) {
      console.error('📧 Password reset error:', error);
      
      if (error.message === 'Request timeout') {
        setError('La requête a pris trop de temps. Veuillez réessayer dans quelques minutes.');
      } else {
        setError('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.');
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    session,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}