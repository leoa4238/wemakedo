import { getGathering, joinGathering } from "../actions"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CommentsSection } from "@/components/comments-section"
import { LikeButton } from "@/components/like-button"
import { DeleteGatheringButton } from "@/components/delete-gathering-button"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function GatheringDetailPage({ params }: PageProps) {
    const { id } = await params
    const gathering = await getGathering(parseInt(id))

    if (!gathering) {
        notFound()
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // @ts-ignore: participations is joined
    const participations = gathering.participations || []
    // @ts-ignore: comments is joined
    const comments = gathering.comments || []
    // @ts-ignore: likes is joined
    const likes = gathering.likes || []

    const isHost = user?.id === gathering.host_id
    const isJoined = participations.some((p: any) => p.user?.id === user?.id)
    const isFull = participations.length >= gathering.capacity
    const isLiked = likes.some((l: any) => l.user_id === user?.id)

    const dateObj = new Date(gathering.meet_at)
    const isEnded = new Date() > dateObj

    const dateStr = dateObj.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
    })
    const timeStr = dateObj.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    })

    // Server Action wrapper for join button
    async function joinAction() {
        "use server"
        await joinGathering(parseInt(id))
    }

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />

            <main className="container mx-auto max-w-4xl px-4 py-8">
                {/* Image Section */}
                <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:aspect-[21/9] ${isEnded ? 'grayscale' : ''}`}>
                    {gathering.image_url ? (
                        <Image
                            src={gathering.image_url}
                            alt={gathering.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <span className="text-6xl">🏢</span>
                        </div>
                    )}
                    <div className="absolute left-4 top-4 z-20">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                            {gathering.category}
                        </span>
                    </div>
                    {isEnded && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <span className="transform -rotate-12 rounded-xl border-4 border-white px-8 py-2 text-3xl font-bold text-white shadow-2xl">
                                종료된 모임
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-start justify-between">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                                    {gathering.title}
                                </h1>
                                <LikeButton
                                    gatheringId={gathering.id}
                                    initialIsLiked={isLiked}
                                    initialLikeCount={likes.length}
                                    isLoggedIn={!!user}
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={gathering.host?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${gathering.host?.email}`}
                                                alt={gathering.host?.name || "Host"}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="font-medium">{gathering.host?.name}</span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(gathering.created_at).toLocaleDateString()} 개설
                                    </span>
                                </div>

                                {/* Delete Button for Host */}
                                {isHost && (
                                    <DeleteGatheringButton gatheringId={gathering.id} />
                                )}
                            </div>
                        </div>

                        <div className="prose prose-blue max-w-none dark:prose-invert">
                            <h3 className="text-xl font-semibold">모임 소개</h3>
                            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                {gathering.content}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <CommentsSection
                            gatheringId={gathering.id}
                            comments={comments}
                            currentUserId={user?.id}
                        />
                    </div>

                    {/* Sidebar / Floating Action Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-1 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {dateStr}
                                        </p>
                                        <p className="text-sm text-gray-500">{timeStr}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-1 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {gathering.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="mt-1 h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="flex justify-between items-center w-full">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                참여 인원
                                            </p>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {participations.length} / {gathering.capacity}명
                                            </span>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((participations.length / gathering.capacity) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                {isEnded ? (
                                    <div className="space-y-3">
                                        <Button className="w-full bg-gray-400 hover:bg-gray-400 cursor-not-allowed" disabled size="lg">
                                            종료된 모임입니다
                                        </Button>
                                        <div className="text-center text-sm text-gray-500">
                                            아쉽지만 다음 기회에 함께해요! 👋
                                        </div>
                                    </div>
                                ) : isJoined ? (
                                    <div className="space-y-3">
                                        <div className="flex w-full items-center justify-center rounded-lg bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
                                            <span className="font-medium">참여 확정되었습니다! 🎉</span>
                                        </div>
                                        <div className="text-center text-sm text-gray-500">
                                            모임 시간과 장소를 꼭 확인해주세요.
                                        </div>
                                    </div>
                                ) : isFull ? (
                                    <Button className="w-full" disabled size="lg">
                                        모집 마감
                                    </Button>
                                ) : user ? (
                                    <form action={joinAction}>
                                        <Button type="submit" className="w-full" size="lg">
                                            참여하기
                                        </Button>
                                    </form>
                                ) : (
                                    <Button asChild className="w-full" size="lg">
                                        <a href={`/login?next=/gatherings/${id}`}>로그인하고 참여하기</a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
