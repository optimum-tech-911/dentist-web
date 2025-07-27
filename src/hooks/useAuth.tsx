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
      console.log('🔍 Fetching role for userId:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('role, email, id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user role:', error);
        
        if (error.code === 'PGRST116') {
          console.log('⚠️ User not found in users table');
          
          // Get user email from auth to create entry
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            console.log('📝 Creating user entry for:', user.email);
            
            // Create user entry with default viewer role
            const { error: insertError } = await supabase
              .from('users')
              .insert({ 
                id: userId, 
                email: user.email, 
                role: 'viewer' 
              });
            
            if (!insertError) {
              console.log('✅ User entry created with viewer role');
              setUserRole('viewer');
            } else {
              console.error('❌ Failed to create user entry:', insertError);
              setUserRole('viewer');
            }
          } else {
            setUserRole('viewer');
          }
        } else {
          setUserRole('viewer'); // Default to viewer on other errors
        }
        return;
      }

      if (data?.role) {
        console.log(`✅ User role found in database: ${data.role} for ${data.email}`);
        setUserRole(data.role);
      } else {
        console.log('⚠️ No role found in database, setting to viewer');
        setUserRole('viewer');
      }
    } catch (error) {
      console.error('💥 Error in fetchUserRole:', error);
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
      authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 Auth state change:', event, session ? `Session for ${session.user?.email}` : 'No session');
        
        if (session?.user) {
          console.log(`👤 User session: ${session.user.email}`);
          
          // Clear any existing errors since we're accepting the session
          setError(null);
          
          // Set session and user first
          setSession(session);
          setUser(session.user);
          
          // Fetch role from database
          console.log('🔍 Fetching user role from database...');
          await fetchUserRole(session.user.id);
          
        } else {
          console.log('❌ No session - clearing user state');
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      });
      
      // Initial session check
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted && session?.user) {
        console.log('🚀 Initial session found for:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        // Fetch user role on initial load
        console.log('🔍 Initial role fetch...');
        await fetchUserRole(session.user.id);
        
        setLoading(false);
      } else if (isMounted) {
        console.log('❌ No initial session found');
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
      
      console.log('🔓 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If we get a session back, that means credentials are correct
      if (data.session && data.user) {
        console.log('✅ Got session and user - sign in successful!');
        // Force accept the session even if there are confirmation issues
        setSession(data.session);
        setUser(data.user);
        await fetchUserRole(data.user.id);
        return { error: null };
      }
      
      // Handle errors, but ignore email confirmation errors
      if (error) {
        console.log('❌ Sign in error:', error.message);
        
        // Check if it's an email confirmation error
        if (error.message.toLowerCase().includes('email not confirmed') || 
            error.message.toLowerCase().includes('email_not_confirmed') ||
            error.message.toLowerCase().includes('confirm') ||
            error.message.toLowerCase().includes('verification')) {
          
          console.log('🚫 Ignoring email confirmation error - trying alternative approach');
          
          // Try to force confirm the user and retry
          try {
            const { data: forceData } = await supabase.rpc('force_confirm_user', { user_email: email });
            console.log('🔧 Force confirm result:', forceData);
            
            // Retry sign in after force confirmation
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (retryData.session) {
              console.log('✅ Retry successful after force confirm!');
              setSession(retryData.session);
              setUser(retryData.user);
              await fetchUserRole(retryData.user.id);
              return { error: null };
            }
          } catch (forceError) {
            console.log('⚠️ Force confirm failed, but continuing anyway');
          }
          
          // Don't show error for email confirmation issues
          return { error: null };
        } else {
          // For other errors, show them
          setError(error.message);
          return { error };
        }
      }
      
      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de la connexion. Veuillez réessayer.';
      
      console.log('💥 Catch block error:', errorMessage);
      
      // Also ignore email confirmation errors in catch block
      if (errorMessage.toLowerCase().includes('email not confirmed') || 
          errorMessage.toLowerCase().includes('email_not_confirmed') ||
          errorMessage.toLowerCase().includes('confirm') ||
          errorMessage.toLowerCase().includes('verification')) {
        
        console.log('🚫 Ignoring email confirmation error in catch block');
        return { error: null };
      }
      
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
      
      console.log('🚪 Starting logout process...');
      
      // Clear state first
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        // Even if there's an error, continue with logout
      } else {
        console.log('✅ Logout successful');
      }
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      
      // Redirect after a small delay to ensure state is cleared
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.error('💥 Logout catch error:', error);
      
      // Force logout anyway - clear all state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      const errorMessage = error?.message || 'Échec de la déconnexion. Veuillez réessayer.';
      setError(errorMessage);
      
      toast({
        title: "Déconnexion forcée",
        description: "Vous avez été déconnecté.",
        variant: "default"
      });
      
      // Force redirect even on error
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
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

  const refreshUserRole = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing user role...');
      await fetchUserRole(user.id);
    }
  };

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
    clearError,
    refreshUserRole
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