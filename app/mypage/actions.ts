'use server'

import { createClient } from '@/utils/supabase/server'

// [마이페이지 데이터 조회]
// 사용자가 만든 모임(Hosted), 참여한 모임(Joined), 찜한 모임(Liked)을 모두 가져옵니다.
export async function getUserData() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // 0. Public Profile 조회
    const { data: publicProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // 1. 내가 만든 모임 (Hosted)
    // gatherings 테이블에서 host_id가 내 ID인 항목 조회
    const { data: hosted } = await supabase
        .from('gatherings')
        .select(`
            *,
            participations(count),
            likes(count)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

    // 2. 내가 참여한 모임 (Joined)
    // participations 테이블을 통해 gatherings 정보 조회
    const { data: joined } = await supabase
        .from('participations')
        .select(`
            gathering:gatherings(
                *,
                host:users(name, avatar_url),
                participations(count)
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'joined') // 승인된 모임만 (현재 MVP는 모두 joined)
        .order('created_at', { ascending: false })

    // 3. 내가 찜한 모임 (Liked)
    // likes 테이블을 통해 gatherings 정보 조회
    const { data: liked } = await supabase
        .from('likes')
        .select(`
            gathering:gatherings(
                *,
                host:users(name, avatar_url),
                participations(count)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return {
        user,
        profile: publicProfile, // Add profile data
        hosted: hosted || [],
        // joined와 liked는 구조가 다르므로 gathering 객체만 추출하여 매핑
        joined: joined?.map((d: any) => d.gathering) || [],
        liked: liked?.map((d: any) => d.gathering) || [],
    }
}
