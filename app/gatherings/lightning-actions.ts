'use server'

import { createClient } from '@/utils/supabase/server'
import { getDistance } from 'geolib'

export interface GatheringWithDistance {
    id: number
    title: string
    meet_at: string
    location: string
    category: string | null
    image_url: string | null
    capacity: number
    participant_count?: number
    distance?: number
    latitude: number | null
    longitude: number | null
}

// [Lightning] "지금 여기" - 1시간 내 시작 & 500m 이내 (서버에서 시간 필터, 클라이언트에서 거리 필터 추천하지만, 여기선 다 처리)
// lat, lng가 없으면 시간만 필터링
export async function getLightningGatherings(latitude?: number, longitude?: number) {
    const supabase = await createClient()

    // 1. 시간 필터: 지금 ~ 1시간 30분 뒤 (여유 있게)
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 90 * 60 * 1000)

    const { data: gatherings, error } = await supabase
        .from('gatherings')
        .select(`
            *,
            participations (count)
        `)
        .eq('status', 'recruiting')
        .gte('meet_at', now.toISOString())
        .lte('meet_at', oneHourLater.toISOString())
        .order('meet_at', { ascending: true })

    if (error) {
        console.error('Error fetching lightning gatherings:', error)
        return []
    }

    // 2. 데이터 가공 (거리 계산)
    let results = gatherings.map((g) => {
        let distance = undefined
        if (latitude && longitude && g.latitude && g.longitude) {
            distance = getDistance(
                { latitude, longitude },
                { latitude: g.latitude, longitude: g.longitude }
            )
        }
        return {
            ...g,
            participant_count: g.participations?.[0]?.count || 0,
            distance,
        }
    })

    // 3. 거리 필터 (500m 이내) - lat/lng가 있을 때만
    if (latitude && longitude) {
        results = results.filter((g) => g.distance !== undefined && g.distance <= 1000) // 1km로 약간 넉넉하게 잡음 (500m는 너무 좁을 수 있음)
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return results
}

// [Lunch] "점심 친구" - 오늘 점심시간 (11:30 ~ 13:00) & 카테고리 'lunch' or 'meal'
export async function getLunchGatherings() {
    const supabase = await createClient()

    // 오늘 날짜의 00:00 ~ 23:59 (사실상 오늘 열리는 모든 점심 모임)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { data: gatherings, error } = await supabase
        .from('gatherings')
        .select(`
            *,
            participations (count)
        `)
        .eq('status', 'recruiting')
        // 카테고리가 lunch 인 경우
        .eq('category', 'lunch')
        .gte('meet_at', todayStart.toISOString())
        .lte('meet_at', todayEnd.toISOString())
        .order('meet_at', { ascending: true })

    if (error) {
        console.error('Error fetching lunch gatherings:', error)
        return []
    }

    return gatherings.map((g) => ({
        ...g,
        participant_count: g.participations?.[0]?.count || 0,
    }))
}
