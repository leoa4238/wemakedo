'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type CreateGatheringInput = {
    title: string
    content: string
    location: string
    meet_at: string
    capacity: number
    category: string
    image_url?: string
    latitude?: number
    longitude?: number
}

export async function createGathering(input: CreateGatheringInput) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    const { data, error } = await supabase
        .from('gatherings')
        .insert({
            host_id: user.id,
            title: input.title,
            content: input.content,
            location: input.location,
            meet_at: input.meet_at,
            capacity: input.capacity,
            category: input.category,
            image_url: input.image_url,
            latitude: input.latitude,
            longitude: input.longitude,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating gathering:', error)
        throw new Error('Failed to create gathering')
    }

    // Also add the host as a participant
    const { error: participationError } = await supabase
        .from('participations')
        .insert({
            user_id: user.id,
            gathering_id: data.id,
            status: 'joined',
        })

    if (participationError) {
        console.error('Error adding host to participants:', participationError)
        // Non-critical error, but good to log
    }

    revalidatePath('/')
    redirect(`/gatherings/${data.id}`)
}

export async function joinGathering(gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase.from('participations').insert({
        user_id: user.id,
        gathering_id: gatheringId,
        status: 'joined', // MVP: auto-join without approval
    })

    if (error) {
        console.error('Error joining gathering:', error)
        if (error.code === '23505') {
            // Unique constraint violation
            throw new Error('Already joined')
        }
        throw new Error('Failed to join gathering')
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

export async function getGatherings() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('gatherings')
        .select(`
      *,
      host:users(name, avatar_url),
      participations(count)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching gatherings:', error)
        return []
    }

    return data
}

export async function getGathering(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('gatherings')
        .select(`
      *,
      host:users(*),
      participations(
        user:users(*)
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching gathering:', error)
        return null
    }

    return data
}
