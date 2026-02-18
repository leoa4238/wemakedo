'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/app/gatherings/community-actions'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Comment {
    id: number
    content: string
    created_at: string
    user_id: string
    user: {
        name: string | null
        avatar_url: string | null
    } | null
}

interface CommentsSectionProps {
    gatheringId: number
    comments: Comment[]
    currentUserId?: string
}

export function CommentsSection({ gatheringId, comments, currentUserId }: CommentsSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [content, setContent] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await addComment(gatheringId, content)
            setContent('') // Reset form
        } catch (error) {
            console.error(error)
            alert('댓글 작성 실패')
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(commentId: number) {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            await deleteComment(commentId, gatheringId)
        } catch (error) {
            console.error(error)
            alert('댓글 삭제 실패')
        }
    }

    return (
        <div className="mt-12 border-t pt-8 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                댓글 ({comments.length})
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-8">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <img
                                src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=User`}
                                alt={comment.user?.name || 'User'}
                                className="h-10 w-10 rounded-full bg-gray-200 object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {comment.user?.name || '익명'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                                        </span>
                                    </div>
                                    {currentUserId === comment.user_id && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm py-4">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                )}
            </div>

            {/* Comment Form */}
            {currentUserId ? (
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="궁금한 점이나 기대평을 남겨보세요."
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !content.trim()} size="sm">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '등록'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500 dark:bg-gray-800">
                    댓글을 작성하려면 로그인이 필요합니다.
                </div>
            )}
        </div>
    )
}
