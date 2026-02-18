'use client'

import { GatheringCard } from "@/components/gathering-card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { getDistance } from "geolib"

interface Gathering {
    id: number
    title: string
    location: string
    meet_at: string
    capacity: number
    image_url: string | null
    category: string | null
    status: 'recruiting' | 'closed' | 'canceled'
    created_at: string
    latitude: number | null
    longitude: number | null
    host: {
        name: string | null
        avatar_url: string | null
    } | null
    participations: {
        count: number
    }[]
}

interface GatheringListProps {
    initialGatherings: any[] // Using any to avoid strict type mismatch with Supabase return type for now
}

export function GatheringList({ initialGatherings }: GatheringListProps) {
    const [gatherings, setGatherings] = useState<Gathering[]>(initialGatherings)
    const [sortByDistance, setSortByDistance] = useState(false)
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    useEffect(() => {
        if (sortByDistance) {
            if (!userLocation) {
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setUserLocation({ latitude, longitude });
                            sortGatherings({ latitude, longitude });
                        },
                        (error) => {
                            console.error("Error getting location:", error);
                            alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
                            setSortByDistance(false);
                        }
                    );
                } else {
                    alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
                    setSortByDistance(false);
                }
            } else {
                sortGatherings(userLocation);
            }
        } else {
            // Reset to initial order
            setGatherings(initialGatherings);
        }
    }, [sortByDistance]); // Removed initialGatherings dependecy to avoid infinite loop if reference changes

    const sortGatherings = (location: { latitude: number; longitude: number }) => {
        const sorted = [...initialGatherings].sort((a, b) => {
            // Gatherings with location come first
            if (!a.latitude || !a.longitude) return 1;
            if (!b.latitude || !b.longitude) return -1;

            const distA = getDistance(location, { latitude: a.latitude, longitude: a.longitude });
            const distB = getDistance(location, { latitude: b.latitude, longitude: b.longitude });

            return distA - distB;
        });
        setGatherings(sorted);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button
                    variant={sortByDistance ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortByDistance(!sortByDistance)}
                    className="rounded-full"
                >
                    <MapPin className="mr-2 h-4 w-4" />
                    {sortByDistance ? "거리순 정렬 중" : "내 주변 모임 찾기"}
                </Button>
            </div>

            {gatherings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {gatherings.map((gathering) => {
                        let distanceLabel = null;
                        if (sortByDistance && userLocation && gathering.latitude && gathering.longitude) {
                            const dist = getDistance(userLocation, { latitude: gathering.latitude, longitude: gathering.longitude });
                            distanceLabel = dist > 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`;
                        }

                        return (
                            <div key={gathering.id} className="relative group">
                                <GatheringCard
                                    id={gathering.id}
                                    title={gathering.title}
                                    location={gathering.location}
                                    meet_at={gathering.meet_at}
                                    capacity={gathering.capacity}
                                    // @ts-ignore
                                    participant_count={gathering.participations[0]?.count || 0}
                                    image_url={gathering.image_url}
                                    category={gathering.category}
                                />
                                {distanceLabel && (
                                    <div className="absolute top-3 right-3 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        {distanceLabel} 거리
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-4xl mb-4">📍</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">주변에 모임이 없습니다</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        위치 정보를 확인하거나, 직접 모임을 만들어보세요!
                    </p>
                </div>
            )}
        </div>
    )
}
