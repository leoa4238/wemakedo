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

// [모임 생성] 새로운 모임을 DB에 생성하고 주최자를 참여자로 등록
export async function createGathering(input: CreateGatheringInput) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    // 1. gathers 테이블에 모임 정보 insert
    const { data: gatheringData, error: gatheringError } = await supabase
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

    if (gatheringError) {
        console.error('Error creating gathering:', gatheringError)
        throw new Error('Failed to create gathering')
    }

    // 2. 주최자(Host)를 자동으로 참여자 목록(participations)에 추가
    const { error: participationError } = await supabase
        .from('participations')
        .insert({
            user_id: user.id,
            gathering_id: gatheringData.id,
            status: 'joined',
        })

    if (participationError) {
        console.error('Error adding host to participants:', participationError)
    }

    revalidatePath('/')
    return { id: gatheringData.id }
}

// [모임 수정] 호스트가 모임 정보 수정
export async function updateGathering(id: number, input: CreateGatheringInput) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    // 1. 호스트 권한 확인
    const { data: gathering } = await supabase
        .from('gatherings')
        .select('host_id')
        .eq('id', id)
        .single()

    if (!gathering) {
        throw new Error('Gathering not found')
    }

    if (gathering.host_id !== user.id) {
        throw new Error('Only host can update gathering')
    }

    // 2. 모임 정보 업데이트
    const { error } = await supabase
        .from('gatherings')
        .update({
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
        .eq('id', id)

    if (error) {
        console.error('Error updating gathering:', error)
        throw new Error('Failed to update gathering')
    }

    revalidatePath('/')
    revalidatePath(`/gatherings/${id}`)
    return { id }
}

// [모임 참여] 현재 유저가 특정 모임에 참여 신청
// [모임 참여 신청] 호스트는 즉시 참여, 게스트는 승인 대기
export async function joinGathering(gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. 호스트인지 확인
    const { data: gathering } = await supabase
        .from('gatherings')
        .select('host_id')
        .eq('id', gatheringId)
        .single()

    if (!gathering) throw new Error('Gathering not found')

    if (gathering.host_id === user.id) {
        // 호스트는 즉시 참여 처리
        const { error } = await supabase.from('participations').insert({
            user_id: user.id,
            gathering_id: gatheringId,
            status: 'joined',
        })
        if (error) throw new Error('Failed to join as host')
    } else {
        // 게스트는 신청서 제출 (gathering_applications)
        const { error } = await supabase.from('gathering_applications').insert({
            user_id: user.id,
            gathering_id: gatheringId,
        })

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('Already applied')
            }
            throw new Error('Failed to apply')
        }
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [신청 취소] 대기 중인 신청 취소
export async function cancelApplication(gatheringId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    await supabase
        .from('gathering_applications')
        .delete()
        .eq('user_id', user.id)
        .eq('gathering_id', gatheringId)

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [신청 승인] 호스트가 신청자 승인 -> participations로 이동
export async function approveApplication(gatheringId: number, targetUserId: string) {
    const supabase = await createClient()

    // 1. Participations에 추가
    const { error: joinError } = await supabase.from('participations').insert({
        user_id: targetUserId,
        gathering_id: gatheringId,
        status: 'joined'
    })

    if (joinError) throw new Error('Failed to approve')

    // 2. Applications에서 삭제
    await supabase.from('gathering_applications').delete()
        .eq('user_id', targetUserId)
        .eq('gathering_id', gatheringId)

    // 3. 알림 생성
    const { data: gathering } = await supabase.from('gatherings').select('title').eq('id', gatheringId).single()
    if (gathering) {
        await supabase.from('notifications').insert({
            user_id: targetUserId,
            type: 'APPROVAL',
            content: `'${gathering.title}' 참여가 승인되었습니다! 🎉`,
            link_url: `/gatherings/${gatheringId}`
        })
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [신청 거절] 호스트가 신청자 거절 -> applications에서 삭제
export async function rejectApplication(gatheringId: number, targetUserId: string) {
    const supabase = await createClient()

    await supabase.from('gathering_applications').delete()
        .eq('user_id', targetUserId)
        .eq('gathering_id', gatheringId)

    // 알림 생성
    const { data: gathering } = await supabase.from('gatherings').select('title').eq('id', gatheringId).single()
    if (gathering) {
        await supabase.from('notifications').insert({
            user_id: targetUserId,
            type: 'REJECTION',
            content: `'${gathering.title}' 참여가 거절되었습니다. 🥲`,
            link_url: `/gatherings/${gatheringId}`
        })
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [신청자 목록 조회] 호스트용
export async function getApplications(gatheringId: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('gathering_applications')
        .select(`
            *,
            *,
            user:users(*, participations(count))
        `)
        .eq('gathering_id', gatheringId)
        .order('created_at', { ascending: true })

    if (error) return []
    return data
}

// [전체 모임 조회] 필터링 기능을 포함하여 모임 목록 가져오기
export type GatheringFilters = {
    category?: string
    query?: string
    status?: 'open'
    limit?: number
}

export async function getGatherings(filters?: GatheringFilters) {
    const supabase = await createClient()
    let query = supabase
        .from('gatherings')
        .select(`
      *,
      host:users(name, avatar_url),
      participations(count)
    `)
        .order('created_at', { ascending: false })

    // 1. 카테고리 필터
    if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
    }

    // 2. 검색어 필터 (제목 또는 내용)
    if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`)
    }

    // 3. 모집 상태 필터 ('open'인 경우 마감되지 않고, 날짜가 지나지 않은 모임만)
    if (filters?.status === 'open') {
        const now = new Date().toISOString()
        // 날짜가 지나지 않은 모임
        query = query.gt('meet_at', now)
        // (참여 인원 체크는 DB 쿼리 레벨에서 복잡하므로, 일단 날짜 기준으로만 필터링하거나
        //  클라이언트에서 처리할 수도 있지만, 여기서는 날짜 기준만 적용)
    }

    // 4. 개수 제한
    if (filters?.limit) {
        query = query.limit(filters.limit)
    }

    const { data, error } = await query

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
      host:users(name, avatar_url, manner_score),
      participations(user:users(*)),
      comments(
        id, content, created_at, user_id,
        user:users(name, avatar_url)
      ),
      likes(user_id)
    `)
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null
        }
        console.error('Error fetching gathering:', JSON.stringify(error, null, 2))
        return null
    }

    return data
}

// [모임 삭제] 호스트가 자신의 모임을 삭제
export async function deleteGathering(gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    // 1. 호스트 권한 확인
    const { data: gathering } = await supabase
        .from('gatherings')
        .select('host_id')
        .eq('id', gatheringId)
        .single()

    if (!gathering) {
        throw new Error('Gathering not found')
    }

    if (gathering.host_id !== user.id) {
        throw new Error('Only host can delete gathering')
    }

    // 2. 모임 삭제 (Cascade 설정이 되어 있다면 관련 데이터도 삭제됨)
    const { error } = await supabase
        .from('gatherings')
        .delete()
        .eq('id', gatheringId)

    if (error) {
        console.error('Error deleting gathering:', error)
        throw new Error('Failed to delete gathering')
    }

    revalidatePath('/')
}
