"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { submitReview } from "@/app/reviews/actions"
import { ThumbsUp, ThumbsDown, User, Check, Loader2 } from "lucide-react"

interface Participant {
    user: {
        id: string
        name: string | null
        avatar_url: string | null
    }
}

interface MannerReviewModalProps {
    gatheringId: number
    currentUserId: string
    participations: Participant[]
    initialCompletedIds?: string[]
    onReviewSubmitted?: () => void
}

export function MannerReviewModal({
    gatheringId,
    currentUserId,
    participations,
    initialCompletedIds = [],
    onReviewSubmitted
}: MannerReviewModalProps) {
    const [open, setOpen] = useState(false)
    const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set())
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompletedIds))

    // Filter out the current user
    const otherParticipants = participations
        .map(p => p.user)
        .filter(u => u && u.id !== currentUserId)

    const handleReview = async (revieweeId: string, score: 1 | -1) => {
        try {
            setSubmittingIds(prev => new Set(prev).add(revieweeId))
            await submitReview(gatheringId, revieweeId, score)

            setCompletedIds(prev => new Set(prev).add(revieweeId))
            if (onReviewSubmitted) onReviewSubmitted()
        } catch (error: any) {
            console.error("Failed to submit review:", error)
            alert(error.message || "평가 제출에 실패했습니다.")
        } finally {
            setSubmittingIds(prev => {
                const next = new Set(prev)
                next.delete(revieweeId)
                return next
            })
        }
    }

    if (otherParticipants.length === 0) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40">
                    🌡️ 참여자 매너 평가하기
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>함께한 멤버들의 매너는 어땠나요?</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {otherParticipants.map(participant => {
                        const isSubmitting = submittingIds.has(participant.id)
                        const isCompleted = completedIds.has(participant.id)

                        return (
                            <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                                        {participant.avatar_url ? (
                                            <img
                                                src={participant.avatar_url}
                                                alt={participant.name || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                                        {participant.name || "익명 사용자"}
                                    </span>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    {isCompleted ? (
                                        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-md dark:bg-green-900/20 dark:text-green-400 font-medium">
                                            <Check className="w-4 h-4 mr-1" />
                                            평가 완료
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-500"
                                                onClick={() => handleReview(participant.id, 1)}
                                                disabled={isSubmitting}
                                                title="매너 온도 올리기 (+0.5°C)"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-blue-600 hover:text-white hover:bg-blue-500 hover:border-blue-500"
                                                onClick={() => handleReview(participant.id, -1)}
                                                disabled={isSubmitting}
                                                title="별로였어요 (-0.5°C)"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}
