'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// [리뷰 제출] 좋아요(+1) 또는 별로예요(-1)
export async function submitReview(gatheringId: number, revieweeId: string, score: 1 | -1) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    if (user.id === revieweeId) {
        throw new Error('Cannot review yourself')
    }

    // 1. 리뷰 저장 (DB 트리거가 manner_score 자동 업데이트)
    const { error } = await supabase
        .from('user_reviews')
        .insert({
            reviewer_id: user.id,
            reviewee_id: revieweeId,
            gathering_id: gatheringId,
            score: score
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Already reviewed this user for this gathering')
        }
        console.error('Error submitting review:', error)
        throw new Error(`Failed to submit review: ${error.message} (Code: ${error.code})`)
    }

    revalidatePath(`/gatherings/${gatheringId}`)
    return { success: true }
}

// [리뷰 가능 여부 확인] 내가 이 모임에서 누구누구를 리뷰했는지 조회
export async function getMyReviewsEx(gatheringId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('user_reviews')
        .select('reviewee_id, score')
        .eq('reviewer_id', user.id)
        .eq('gathering_id', gatheringId)

    return data || []
}
