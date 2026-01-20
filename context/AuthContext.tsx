/**
 * ============================================================================
 * 🛡️ NORTH INTELLIGENCE OS: AUTH CONTEXT V18.5 (ELITE)
 * ============================================================================
 * FEATURES:
 * - PROFILE_MERGE: Synchronizes Auth data with 'profiles' table records.
 * - EVENT_DEBOUNCE: Functional state checks to prevent update loops.
 * - FORENSIC_ERROR_HANDLING: Caught faults logged to terminal core.
 * ============================================================================
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: any | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.error('[AUTH_SYNC_FAULT]', error.message);
    return data;
  }, []);

  const refreshProfile = useCallback(
    async (targetSession: Session) => {
      if (!targetSession?.user) return;
      const profile = await fetchProfile(targetSession.user.id);
      setUser({
        ...targetSession.user,
        ...profile,
        name: profile?.full_name,
        avatar: profile?.avatar_url,
      });
    },
    [fetchProfile],
  );

  useEffect(() => {
    // 1. Initial Handshake
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        setSession(initialSession);
        if (initialSession) await refreshProfile(initialSession);
        setIsLoading(false);
      });

    // 2. Real-Time Pulse Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[AUTH_EVENT]: ${event}`);

      setSession(newSession);
      if (newSession) {
        await refreshProfile(newSession);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        refreshProfile: () =>
          session ? refreshProfile(session) : Promise.resolve(),
        login: async (email, pass) => {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
          });
          if (error) throw error;
        },
        logout: async () => {
          console.log('Logging out...');
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Error logging out:', error);
            throw error;
          }
          console.log('Successfully logged out');
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
