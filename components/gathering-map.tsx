'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LocateFixed } from 'lucide-react'

// Leaflet 아이콘 설정 (Next.js에서 이미지 경로 문제 해결)
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface Gathering {
    id: number
    title: string
    latitude: number
    longitude: number
    image_url: string | null
    meet_at: string
}

interface GatheringMapProps {
    gatherings: Gathering[]
}

// [지도 중심 이동 컴포넌트]
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

export default function GatheringMap({ gatherings }: GatheringMapProps) {
    const [center, setCenter] = useState<[number, number]>([37.5665, 126.9780]) // 서울 시청 기본값
    const [zoom, setZoom] = useState(13)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    // 내 위치 찾기
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('브라우저가 위치 정보를 지원하지 않습니다.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                const newCenter: [number, number] = [latitude, longitude]
                setCenter(newCenter)
                setUserLocation(newCenter)
                setZoom(14)
            },
            (error) => {
                console.error(error)
                alert('위치 정보를 가져올 수 없습니다.')
            }
        )
    }

    // 초기 로딩 시 내 위치 시도
    useEffect(() => {
        handleLocateMe()
    }, [])

    return (
        <div className="relative h-[calc(100vh-64px)] w-full">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 내 위치 마커 (파란색 원 등 표현 가능하나, 일단 기본 마커와 구분하기 위해 생략하거나 커스텀 아이콘 필요. 여기선 생략) */}

                {/* 모임 마커들 */}
                {gatherings.map((g) => (
                    // 좌표가 유효한 경우에만 마커 표시
                    g.latitude && g.longitude ? (
                        <Marker
                            key={g.id}
                            position={[g.latitude, g.longitude]}
                            icon={icon}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-gray-100">
                                        {g.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={g.image_url} alt={g.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <h3 className="font-bold text-sm line-clamp-1">{g.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(g.meet_at).toLocaleDateString()} {new Date(g.meet_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <Link
                                            href={`/gatherings/${g.id}`}
                                            className="mt-2 block w-full rounded-md bg-blue-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                            자세히 보기
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>

            {/* 내 위치 버튼 */}
            <div className="absolute bottom-6 right-6 z-[1000]">
                <Button
                    onClick={handleLocateMe}
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
                    title="내 위치로 이동"
                >
                    <LocateFixed className="h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}
