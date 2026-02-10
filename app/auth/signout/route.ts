import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const supabase = createClient()

    // Check if we have a session
    const {
        data: { user },
    } = await (await supabase).auth.getUser()

    if (user) {
        await (await supabase).auth.signOut()
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
