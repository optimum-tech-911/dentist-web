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
  refreshUserRole: () => Promise<void>;
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

  const refreshUserRole = async () => {
    // No-op for fallback provider
  };

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
    clearError,
    refreshUserRole
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Set to false by default for instant UI
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);

  // Function to fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in users table, default to viewer
          console.log('User not found in users table, setting role to viewer');
          setUserRole('viewer');
        } else {
          console.error('Error fetching user role:', error);
          setUserRole('viewer'); // Default to viewer on error
        }
        return;
      }

      if (data?.role) {
        setUserRole(data.role);
        console.log('User role set to:', data.role);
      } else {
        setUserRole('viewer'); // Default to viewer if no role found
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('viewer'); // Default to viewer on error
    }
  };

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

    // Setup auth listener with role fetching
    const setupAuthListener = async () => {
      authSubscription = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role from database when user is authenticated
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      });
      
      // Initial session check
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role on initial load
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
        
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
      
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (!error) {
        // Send welcome email via Resend API
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'UFSBD Hérault <onboarding@resend.dev>',
              to: email,
              subject: 'Bienvenue sur UFSBD Hérault!',
              html: `
                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
                  <div style=\"text-align: center; margin-bottom: 30px;\">
                    <h1 style=\"color: #2563eb; margin: 0;\">Bienvenue !</h1>
                    <p style=\"color: #6b7280; margin: 5px 0;\">Merci de rejoindre l'UFSBD Hérault.</p>
                  </div>
                  <div style=\"background-color: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;\">
                    <h2 style=\"color: #1e293b; margin-top: 0;\">Votre compte a été créé avec succès</h2>
                    <p style=\"color: #374151; line-height: 1.6;\">Bonjour,</p>
                    <p style=\"color: #374151; line-height: 1.6;\">Nous sommes ravis de vous accueillir sur notre plateforme. Vous pouvez dès à présent vous connecter et profiter de nos services.</p>
                    <div style=\"text-align: center; margin: 30px 0;\">
                      <a href=\"https://ufsbd34.fr/auth\" style=\"background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;\">Se connecter</a>
                    </div>
                  </div>
                  <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;\">
                    <p style=\"color: #6b7280; font-size: 14px; text-align: center; margin: 0;\">Cet email a été envoyé par UFSBD Hérault<br><strong>Contact :</strong> ufsbd34@ufsbd.fr<br><strong>Site web :</strong> <a href=\"https://ufsbd34.fr\" style=\"color: #2563eb;\">ufsbd34.fr</a></p>
                  </div>
                </div>
              `
            })
          });
        } catch (welcomeError) {
          if (import.meta.env.DEV) {
            console.error('Welcome email error:', welcomeError);
          }
        }
      }
      
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
      setError(null);
      toast({
        title: "Email de réinitialisation envoyé !",
        description: "Si votre email existe, vous recevrez un lien de réinitialisation sous peu.",
        variant: "default"
      });
      return { error: null };
    }

    setLoading(true);
    setError(null);

    // Fire and forget: do not block UI
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.error('📧 Password reset error:', error);
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('📧 Password reset error:', error);
        }
      });

    // Always show success message instantly
    toast({
      title: "Email de réinitialisation envoyé !",
      description: "Si votre email existe, vous recevrez un lien de réinitialisation sous peu.",
      variant: "default"
    });

    setTimeout(() => setLoading(false), 1000); // Never block UI for more than 1s
    return { error: null };
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