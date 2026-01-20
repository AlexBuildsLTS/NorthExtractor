/**
 * ============================================================================
 * 🔐 NORTH INTELLIGENCE OS: TITAN-CORE AUTH PROVIDER V11.0 (FINAL RESTORATION)
 * ============================================================================
 * PATH: context/AuthContext.tsx
 * PURPOSE: Global identity orchestration and profile synthesis.
 * FIXES:
 * - TS Error Fix: Omits standard 'role' to allow Database enum alignment.
 * - Profile Restoration: Restores full_name and avatar_url synchronization.
 * - Dual-Naming Support: Exports both logout and signOut for UI stability.
 * - Type-Strict: 1:1 mapping with provided database.types.ts.
 * ============================================================================
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Alert } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database, Tables } from '@/supabase/database.types';

// Extract strict types from your provided Schema
type Profile = Tables<'profiles'>;
type UserRole = Database['public']['Enums']['user_role'];

/**
 * OPERATOR STATE (TYPE-STRICT RESTORATION)
 * We omit 'role' from the base User to prevent the intersection crash
 * with your custom enum-based role system.
 */
interface OperatorState extends Omit<User, 'role'> {
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
  proxyConfig: Profile['proxy_config'];
  webhookUrl: string | null;
}

interface AuthContextInterface {
  session: Session | null;
  user: OperatorState | null;
  isLoading: boolean;
  refreshIdentity: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<OperatorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * REFRESH IDENTITY
   * Pulls data directly from your public.profiles ledger.
   * Restores the 'destroyed' profile and avatar linkage.
   */
  const refreshIdentity = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!currentSession) {
        setSession(null);
        setUser(null);
        return;
      }

      setSession(currentSession);

      // Fetch from profiles using provided schema
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[TITAN-AUTH] Profile sync fault:', profileError.message);
      }

      // Map DB columns to the high-fidelity UI requirements
      const synthesizedUser: OperatorState = {
        ...currentSession.user,
        fullName:
          profile?.full_name ||
          currentSession.user.user_metadata?.full_name ||
          'Operator',
        avatarUrl: profile?.avatar_url || null,
        role: (profile?.role as UserRole) || 'Member',
        proxyConfig: profile?.proxy_config || null,
        webhookUrl: profile?.webhook_url || null,
      };

      setUser(synthesizedUser);
    } catch (err: any) {
      console.error('[TITAN-CORE] Ledger Connection Fault:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * SYSTEM INITIALIZATION
   * Synchronizes with real-time auth events.
   */
  useEffect(() => {
    refreshIdentity();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[TITAN-EVENT] Auth: ${event}`);
      if (newSession) {
        setSession(newSession);
        await refreshIdentity();
      } else {
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshIdentity]);

  /**
   * TERMINATION PROTOCOL
   */
  const terminateSession = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Security Fault', 'Termination failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    refreshIdentity,
    login: async (email: string, pass: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (error) throw error;
    },
    logout: terminateSession,
    signOut: terminateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be executed within an AuthProvider scope.');
  }
  return context;
};
