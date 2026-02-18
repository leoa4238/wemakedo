'use client'

import { toggleLike } from '@/app/gatherings/community-actions'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface LikeButtonProps {
    gatheringId: number
    initialIsLiked: boolean
    initialLikeCount: number
    isLoggedIn: boolean
}

export function LikeButton({ gatheringId, initialIsLiked, initialLikeCount, isLoggedIn }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isPending, setIsPending] = useState(false)

    async function handleToggle() {
        if (!isLoggedIn) {
            alert('로그인이 필요한 기능입니다.')
            return
        }

        // Optimistic UI update
        const previousIsLiked = isLiked
        const previousLikeCount = likeCount

        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
        setIsPending(true)

        try {
            await toggleLike(gatheringId)
        } catch (error) {
            console.error(error)
            // Rollback on error
            setIsLiked(previousIsLiked)
            setLikeCount(previousLikeCount)
            alert('찜하기 실패')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
        >
            <Heart
                className={`h-6 w-6 transition-all ${isLiked ? 'fill-current scale-110' : 'scale-100'
                    }`}
            />
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
        </button>
    )
}
