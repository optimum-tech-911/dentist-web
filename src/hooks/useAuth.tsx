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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    // Test Supabase connection first
    const testSupabaseConnection = async () => {
      try {
        // Simple test query
        const { data, error } = await supabase.from('posts').select('id').limit(1);
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
          console.warn('Supabase connection test failed:', error);
          setIsSupabaseAvailable(false);
          setError('Database connection issue. Some features may be limited.');
          return false;
        }
        
        setIsSupabaseAvailable(true);
        return true;
      } catch (err) {
        console.error('Supabase connection test error:', err);
        setIsSupabaseAvailable(false);
        setError('Database connection issue. Some features may be limited.');
        return false;
      }
    };

    // Set up auth state listener with comprehensive error handling
    const setupAuthListener = async () => {
      try {
        // Test connection first
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
          setLoading(false);
          return;
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            try {
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                // Fetch user role with error handling
                try {
                  const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                  
                  if (!error && data && isMounted) {
                    setUserRole(data.role);
                  } else if (error && import.meta.env.DEV) {
                    console.warn('Error fetching user role:', error);
                    // Don't set error state for role fetch issues
                  }
                } catch (err) {
                  if (import.meta.env.DEV) {
                    console.error('Error fetching user role:', err);
                  }
                  // Don't set error state for role fetch issues
                }
              } else {
                setUserRole(null);
              }
            } catch (err) {
              console.error('Auth state change error:', err);
              setError('Authentication state error. Please refresh the page.');
            }
            
            if (isMounted) {
              setLoading(false);
            }
          }
        );

        authSubscription = subscription;

        // Check for existing session
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (isMounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error getting session:', error);
          }
          if (isMounted) {
            setLoading(false);
            setError('Session retrieval error. Please refresh the page.');
          }
        }

      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting up auth listener:', error);
        }
        if (isMounted) {
          setLoading(false);
          setError('Authentication setup error. Please refresh the page.');
        }
      }
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      if (authSubscription) {
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
      
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('📧 Password reset error:', error);
        setError('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.');
        return { error };
      }
      
      toast({
        title: "Email de réinitialisation envoyé !",
        description: "Veuillez vérifier votre boîte mail pour les instructions de réinitialisation du mot de passe.",
        variant: "default"
      });
      
      return { error: null };
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Password reset error:', error);
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