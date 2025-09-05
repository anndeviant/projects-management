import { createClient } from '../supabase/client'

export interface User {
    id: string
    email: string
    role: 'admin' | 'guest'
}

export const signIn = async (email: string, password: string) => {
    const supabase = createClient()

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
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error(error.message)
    }
}

export const getCurrentUser = async (): Promise<User | null> => {
    const supabase = createClient()

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
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        return null
    }

    return session
}
