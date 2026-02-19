"use client"

import { useState, useEffect } from "react"
import { GatheringCard } from "@/components/gathering-card"
import { GatheringWithDistance, getLightningGatherings } from "@/app/gatherings/lightning-actions"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, Utensils, Globe } from "lucide-react"

interface HomeContentProps {
    lunchGatherings: any[]
    children: React.ReactNode
}

export function HomeContent({ lunchGatherings, children }: HomeContentProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'lightning' | 'lunch'>('all')
    const [lightningGatherings, setLightningGatherings] = useState<GatheringWithDistance[]>([])
    const [isLoadingLightning, setIsLoadingLightning] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    // Check if it's lunch time to show badge or default tab (optional)
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const isLunchTime = hours === 11 && minutes >= 30 || hours === 12
    const showLunchBadge = isLunchTime

    const handleTabChange = async (tab: 'all' | 'lightning' | 'lunch') => {
        setActiveTab(tab)

        if (tab === 'lightning' && lightningGatherings.length === 0) {
            setIsLoadingLightning(true)
            setLocationError(null)

            if (!navigator.geolocation) {
                setLocationError("브라우저가 위치 정보를 지원하지 않습니다.")
                setIsLoadingLightning(false)
                return
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords
                        const data = await getLightningGatherings(latitude, longitude)
                        setLightningGatherings(data)
                    } catch (error) {
                        console.error(error)
                        setLocationError("모임 정보를 불러오는데 실패했습니다.")
                    } finally {
                        setIsLoadingLightning(false)
                    }
                },
                (error) => {
                    console.error(error)
                    setLocationError("위치 정보를 가져올 수 없습니다. 권한을 허용해주세요.")
                    setIsLoadingLightning(false)
                    // Fallback: fetch without location (just time based)
                    getLightningGatherings().then(data => setLightningGatherings(data))
                }
            )
        }
    }

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-1 dark:border-gray-800">
                <Button
                    variant={activeTab === 'all' ? "default" : "ghost"}
                    onClick={() => handleTabChange('all')}
                    className={`rounded-full ${activeTab === 'all' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:text-gray-900"}`}
                >
                    <Globe className="mr-2 h-4 w-4" />
                    전체
                </Button>
                <Button
                    variant={activeTab === 'lightning' ? "default" : "ghost"}
                    onClick={() => handleTabChange('lightning')}
                    className={`rounded-full ${activeTab === 'lightning' ? "bg-yellow-400 text-black hover:bg-yellow-500" : "text-gray-500 hover:text-gray-900"}`}
                >
                    <Zap className="mr-2 h-4 w-4" />
                    지금 당장
                </Button>
                <Button
                    variant={activeTab === 'lunch' ? "default" : "ghost"}
                    onClick={() => handleTabChange('lunch')}
                    className={`relative rounded-full ${activeTab === 'lunch' ? "bg-orange-500 text-white hover:bg-orange-600" : "text-gray-500 hover:text-gray-900"}`}
                >
                    <Utensils className="mr-2 h-4 w-4" />
                    점심 친구
                    {showLunchBadge && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'all' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                )}

                {activeTab === 'lightning' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20">
                            <h3 className="flex items-center text-lg font-bold text-yellow-800 dark:text-yellow-200">
                                <Zap className="mr-2 h-5 w-5 fill-yellow-500 text-yellow-500" />
                                급모임! 지금 바로 만나요
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                내 주변(1km)에서 1시간 30분 내에 시작하는 모임들입니다.
                            </p>
                        </div>

                        {isLoadingLightning ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                            </div>
                        ) : locationError ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                {locationError}
                            </div>
                        ) : lightningGatherings.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {lightningGatherings.map((g) => (
                                    <GatheringCard
                                        key={g.id}
                                        {...g}
                                        participant_count={g.participant_count || 0}
                                        category="lightning" // special styling if needed
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                                <p className="mb-2 text-4xl">⚡️</p>
                                <p>지금 주변에 예정된 번개가 없네요.</p>
                                <Button className="mt-4" variant="outline" asChild>
                                    <a href="/gatherings/new">내가 직접 번개 치기</a>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'lunch' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 rounded-xl bg-orange-50 p-6 dark:bg-orange-900/20">
                            <h3 className="flex items-center text-lg font-bold text-orange-800 dark:text-orange-200">
                                <Utensils className="mr-2 h-5 w-5 text-orange-500" />
                                오늘 점심 뭐 먹지?
                            </h3>
                            <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                                직장인 점심 친구, 맛집 탐방 모임입니다. (11:30 ~ 13:00)
                            </p>
                        </div>

                        {lunchGatherings.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {lunchGatherings.map((g) => (
                                    <GatheringCard key={g.id} {...g} participant_count={g.participations?.[0]?.count || 0} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                                <p className="mb-2 text-4xl">🍱</p>
                                <p>오늘 예정된 점심 모임이 없네요.</p>
                                <Button className="mt-4" variant="outline" asChild>
                                    <a href="/gatherings/new">점심 모임 만들기</a>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
