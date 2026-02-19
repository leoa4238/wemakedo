'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(gatheringId: number, content: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase.from('chat_messages').insert({
        gathering_id: gatheringId,
        user_id: user.id,
        content,
    })

    if (error) {
        console.error("Error sending message:", error)
        throw new Error("Failed to send message")
    }

    // No need to revalidate path if using realtime, but good practice for server fetch fallback
    revalidatePath(`/gatherings/${gatheringId}`)
}

export async function getMessages(gatheringId: number) {
    const supabase = await createClient()

    // RLS will handle permissions
    const { data, error } = await supabase
        .from('chat_messages')
        .select(`
            *,
            user:users(id, name, avatar_url)
        `)
        .eq('gathering_id', gatheringId)
        .order('created_at', { ascending: true })
        .limit(100) // Limit to last 100 messages for MVP

    if (error) {
        console.error("Error fetching messages:", error)
        return []
    }

    return data
}
