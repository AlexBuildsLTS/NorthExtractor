// FILE: context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: any | null; // Profile data merged with Auth data
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

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  };

  const refreshProfile = async () => {
    const {
      data: { session: curSession },
    } = await supabase.auth.getSession();
    if (curSession) {
      const profile = await fetchProfile(curSession.user.id);
      setUser({
        ...curSession.user,
        ...profile,
        name: profile?.full_name,
        avatar: profile?.avatar_url,
      });
    }
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        setSession(initialSession);
        if (initialSession) await refreshProfile();
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) await refreshProfile();
      else setUser(null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        refreshProfile,
        login: async (email, pass) => {
          await supabase.auth.signInWithPassword({ email, password: pass });
        },
        logout: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
