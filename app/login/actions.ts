'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

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

    return redirect(data.url)
}
