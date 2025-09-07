"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSession, User } from '@/lib/utils/auth';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    // Use singleton client instance
    const supabase = createClient();

    const updateAuthState = useCallback(async (session: Session | null) => {
        setSession(session);

        if (!session) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error getting user:', error);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                const initialSession = await getSession();

                if (mounted) {
                    await updateAuthState(initialSession);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error getting initial session:', error);
                if (mounted) {
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        getInitialSession();

        // Listen for auth changes with debouncing
        let timeoutId: NodeJS.Timeout;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                // Debounce auth state changes to prevent rapid firing
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    if (!mounted) return;

                    if (event === 'SIGNED_OUT' || !session) {
                        setUser(null);
                        setSession(null);
                        router.push('/login');
                    } else {
                        await updateAuthState(session);
                    }

                    setLoading(false);
                }, 100);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [supabase.auth, router, updateAuthState]);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }

            // Clear local state
            setUser(null);
            setSession(null);

            // Redirect to login
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return {
        user,
        session,
        loading,
        isAuthenticated: !!user && !!session,
        signOut
    };
}
