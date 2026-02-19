'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type UpdateProfileInput = {
    name: string
    company?: string
    job_title?: string
    avatar_url?: string
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const job_title = formData.get('job_title') as string
    const avatar_url = formData.get('avatar_url') as string

    if (!name) {
        return { error: '이름을 입력해주세요.' }
    }

    // 1. Update public.users table (Used for relational data like gathering host)
    const { error: publicUpdateError } = await supabase
        .from('users')
        .update({
            name,
            company,
            job_title,
            avatar_url,
        })
        .eq('id', user.id)

    if (publicUpdateError) {
        console.error('Error updating public profile:', publicUpdateError)
        return { error: '프로필 업데이트에 실패했습니다.' }
    }

    // 2. Update auth.users metadata (Used for session user object)
    const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
            name,
            company,
            job_title,
            avatar_url,
        },
    })

    if (authUpdateError) {
        console.error('Error updating auth metadata:', authUpdateError)
        // Auth update failure is non-critical if public table is updated, but good to report.
    }

    revalidatePath('/mypage')
    redirect('/mypage')
}
