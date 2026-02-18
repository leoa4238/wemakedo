'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function login(provider: 'kakao' | 'google') {
    const supabase = createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await (await supabase).auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        redirect('/login?message=Could not authenticate user')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error(error)
        return { error: 'Cloud not create user' }
    }

    return { success: true, message: 'Check email to continue sign in process' }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error(error)
        return { error: 'Could not authenticate user' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
