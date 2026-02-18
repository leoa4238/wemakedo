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
    // 현재 세션의 유저 정보 가져오기
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
            latitude: input.latitude, // 위치 좌표 (위도)
            longitude: input.longitude, // 위치 좌표 (경도)
        })
        .select()
        .single()

    if (gatheringError) {
        console.error('Error creating gathering:', gatheringError)
        throw new Error('Failed to create gathering')
    }

    // 2. 주최자(Host)를 자동으로 참여자 목록(participations)에 추가
    // 주최자가 모임의 첫 번째 멤버가 됨
    const { error: participationError } = await supabase
        .from('participations')
        .insert({
            user_id: user.id,
            gathering_id: gatheringData.id,
            status: 'joined',
        })

    if (participationError) {
        console.error('Error adding host to participants:', participationError)
        // 치명적인 오류는 아니므로 로그만 남김
    }

    // 메인 페이지 데이터 갱신 (새 모임 표시)
    revalidatePath('/')
    // 생성된 상세 페이지로 이동
    redirect(`/gatherings/${gatheringData.id}`)
}

// [모임 참여] 현재 유저가 특정 모임에 참여 신청
export async function joinGathering(gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // participations 테이블에 유저-모임 관계 추가
    // DB의 unique(user_id, gathering_id) 제약조건으로 중복 참여 방지됨
    const { error } = await supabase.from('participations').insert({
        user_id: user.id,
        gathering_id: gatheringId,
        status: 'joined', // MVP에서는 즉시 참여 승인
    })

    if (error) {
        console.error('Error joining gathering:', error)
        if (error.code === '23505') {
            // Unique constraint violation (이미 참여함)
            throw new Error('Already joined')
        }
        throw new Error('Failed to join gathering')
    }

    // 상세 페이지 데이터 갱신 (참여 인원 업데이트)
    revalidatePath(`/gatherings/${gatheringId}`)
}

// [전체 모임 조회] 필터링 기능을 포함하여 모임 목록 가져오기
export type GatheringFilters = {
    category?: string
    query?: string
    status?: 'open'
}

export async function getGatherings(filters?: GatheringFilters) {
    const supabase = await createClient()
    let query = supabase
        .from('gatherings')
        .select(`
      *,
      host:users(name, avatar_url),
      participations(count) -- 참여자 수 카운트
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
      host:users(name, avatar_url),
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
        console.error('Error fetching gathering:', error)
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
