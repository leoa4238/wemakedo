'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// [댓글 작성]
export async function addComment(gatheringId: number, content: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        gathering_id: gatheringId,
        content,
    })

    if (error) {
        console.error('Error adding comment:', error)
        throw new Error('Failed to add comment')
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [댓글 삭제]
export async function deleteComment(commentId: number, gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // 본인 댓글만 삭제 가능

    if (error) {
        console.error('Error deleting comment:', error)
        throw new Error('Failed to delete comment')
    }

    revalidatePath(`/gatherings/${gatheringId}`)
}

// [찜하기 토글] (좋아요 <-> 취소)
export async function toggleLike(gatheringId: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User is not authenticated')
    }

    // 1. 이미 찜했는지 확인
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('gathering_id', gatheringId)
        .single()

    if (existingLike) {
        // 2-A. 이미 있으면 삭제 (찜 취소)
        await supabase.from('likes').delete().eq('id', existingLike.id)
    } else {
        // 2-B. 없으면 추가 (찜하기)
        await supabase.from('likes').insert({
            user_id: user.id,
            gathering_id: gatheringId,
        })
    }

    revalidatePath(`/gatherings/${gatheringId}`)
    // 목록 페이지에서도 하트 상태가 바뀌어야 하므로 메인도 갱신
    revalidatePath('/')
}
