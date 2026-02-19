import { getUserData } from "./actions"
import { Header } from "@/components/header"
import { GatheringCard } from "@/components/gathering-card"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, User } from "lucide-react"

// 이 페이지는 항상 최신 데이터를 보여줘야 하므로 동적 렌더링 설정
export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MyPage({ searchParams }: PageProps) {
    const params = await searchParams
    const tab = (typeof params.tab === 'string' ? params.tab : 'hosted') as 'hosted' | 'joined' | 'liked'

    let data
    try {
        data = await getUserData()
    } catch (error) {
        // 로그인 안 된 상태라면 로그인 페이지로 리다이렉트
        redirect('/login?next=/mypage')
    }

    const { user, profile, hosted, joined, liked } = data

    // 현재 탭에 맞는 데이터 선택
    const currentList = tab === 'hosted' ? hosted : tab === 'joined' ? joined : liked

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />

            <main className="container mx-auto max-w-5xl px-4 py-8">
                {/* 1. 프로필 섹션 */}
                <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                            alt={profile?.name || user.user_metadata?.name || "User"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {profile?.name || user.user_metadata?.name || user.email?.split('@')[0]}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>

                        {(profile?.company || profile?.job_title) && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                {profile?.company && <span>{profile.company}</span>}
                                {profile?.company && profile?.job_title && <span>·</span>}
                                {profile?.job_title && <span>{profile.job_title}</span>}
                            </div>
                        )}

                        <Button asChild variant="outline" size="sm" className="mt-3">
                            <Link href="/mypage/edit">
                                프로필 수정
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 2. 탭 네비게이션 */}
                <div className="mb-8 flex justify-center border-b border-gray-200 dark:border-gray-800">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            href="/mypage?tab=hosted"
                            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${tab === 'hosted'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <User className="h-4 w-4" />
                            내가 만든 모임
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {hosted.length}
                            </span>
                        </Link>

                        <Link
                            href="/mypage?tab=joined"
                            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${tab === 'joined'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            참여한 모임
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {joined.length}
                            </span>
                        </Link>

                        <Link
                            href="/mypage?tab=liked"
                            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${tab === 'liked'
                                ? 'border-red-500 text-red-600 dark:text-red-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Heart className="h-4 w-4" />
                            찜한 모임
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {liked.length}
                            </span>
                        </Link>
                    </nav>
                </div>

                {/* 3. 모임 목록 */}
                {currentList.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentList.map((gathering: any) => (
                            <GatheringCard
                                key={gathering.id}
                                id={gathering.id}
                                title={gathering.title}
                                location={gathering.location}
                                meet_at={gathering.meet_at}
                                capacity={gathering.capacity}
                                // @ts-ignore: participant_count comes from joined relation or count aggregation
                                participant_count={gathering.participations?.[0]?.count || 0}
                                image_url={gathering.image_url}
                                category={gathering.category}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            {tab === 'hosted' ? (
                                <User className="h-6 w-6 text-gray-400" />
                            ) : tab === 'liked' ? (
                                <Heart className="h-6 w-6 text-gray-400" />
                            ) : (
                                <Calendar className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                            {tab === 'hosted'
                                ? '개설한 모임이 없습니다'
                                : tab === 'liked'
                                    ? '찜한 모임이 없습니다'
                                    : '참여한 모임이 없습니다'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {tab === 'hosted'
                                ? '직접 모임을 만들어보세요!'
                                : '관심 있는 모임을 찾아보세요!'}
                        </p>
                        <div className="mt-6">
                            {tab === 'hosted' ? (
                                <Button asChild>
                                    <Link href="/gatherings/new">모임 만들기</Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link href="/">모임 둘러보기</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
