"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/utils/auth";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const initRef = useRef(false);

  // Use singleton client instance
  const supabase = createClient();

  const getUserFromSession = useCallback(
    (session: Session | null): User | null => {
      if (!session?.user) return null;

      return {
        id: session.user.id,
        email: session.user.email!,
        role: session.user.email === "admin@example.com" ? "admin" : "guest",
      };
    },
    []
  );

  const updateAuthState = useCallback(
    (newSession: Session | null) => {
      setSession(newSession);
      setUser(getUserFromSession(newSession));
    },
    [getUserFromSession]
  );

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (mounted) {
          if (error) {
            console.error("Error getting initial session:", error);
            updateAuthState(null);
          } else {
            updateAuthState(session);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (mounted) {
          updateAuthState(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with debouncing
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, !!session);

      // Clear any existing timeout
      clearTimeout(timeoutId);

      // Debounce rapid auth changes
      timeoutId = setTimeout(() => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          updateAuthState(null);
          // Only redirect to login if we're on a protected route
          const currentPath = window.location.pathname;
          const isProtectedRoute = ["/dashboard", "/projects"].some((route) =>
            currentPath.startsWith(route)
          );

          if (isProtectedRoute) {
            router.push("/login");
          }
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          updateAuthState(session);
        }

        setLoading(false);
      }, 100);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase.auth, router, updateAuthState]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Clear auth state will be handled by onAuthStateChange
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [supabase.auth]);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
