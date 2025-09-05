import { createClient } from '../supabase/client'

export interface User {
    id: string
    email: string
    role: 'admin' | 'guest'
}

// Cache the supabase client instance
const supabase = createClient();

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export const signOut = async () => {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error(error.message)
    }

    // Clear any localStorage items
    if (typeof window !== 'undefined') {
        // Clear all auth-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('supabase') || key.includes('auth'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage as well
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.startsWith('supabase') || key.includes('auth'))) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
}

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Default role is guest, you can implement role-based logic here
    return {
        id: user.id,
        email: user.email!,
        role: user.email === 'admin@example.com' ? 'admin' : 'guest'
    }
}

export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        return null
    }

    return session
}
