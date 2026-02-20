'use client'

import { approveApplication, rejectApplication } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useState } from "react"

interface Application {
    id: number
    user_id: string
    created_at: string
    user: {
        name: string | null
        avatar_url: string | null
        participations?: { count: number }[]
    }
}

interface ApplicationListProps {
    gatheringId: number
    initialApplications: any[] // TODO: Type definition
}

export function ApplicationList({ gatheringId, initialApplications }: ApplicationListProps) {
    const [applications, setApplications] = useState<Application[]>(initialApplications)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleApprove = async (userId: string) => {
        if (!confirm('승인하시겠습니까?')) return
        setProcessingId(userId)
        try {
            await approveApplication(gatheringId, userId)
            setApplications(prev => prev.filter(app => app.user_id !== userId))
        } catch (error) {
            console.error(error)
            alert('승인 중 오류가 발생했습니다.')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (userId: string) => {
        if (!confirm('거절하시겠습니까?')) return
        setProcessingId(userId)
        try {
            await rejectApplication(gatheringId, userId)
            setApplications(prev => prev.filter(app => app.user_id !== userId))
        } catch (error) {
            console.error(error)
            alert('거절 중 오류가 발생했습니다.')
        } finally {
            setProcessingId(null)
        }
    }

    if (applications.length === 0) return null

    return (
        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-900/20">
            <h3 className="mb-4 text-lg font-bold text-orange-900 dark:text-orange-100">
                승인 대기 중인 신청자 ({applications.length})
            </h3>
            <div className="space-y-4">
                {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">

                                <img
                                    src={app.user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${app.user_id}`}
                                    alt={app.user.name || "User"}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {app.user.name || "익명 사용자"}
                                    {/* Newbie Badge: Check if participation count is 0 */}
                                    {(!app.user.participations || app.user.participations[0]?.count === 0) && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                            🌱 뉴비
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(app.created_at).toLocaleDateString()} 신청
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:bg-transparent dark:text-red-400"
                                onClick={() => handleReject(app.user_id)}
                                disabled={processingId === app.user_id}
                            >
                                <X className="mr-1 h-4 w-4" /> 거절
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(app.user_id)}
                                disabled={processingId === app.user_id}
                            >
                                <Check className="mr-1 h-4 w-4" /> 승인
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
