'use client'

import dynamic from "next/dynamic"

const GatheringMap = dynamic(() => import("@/components/gathering-map"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-lg font-medium text-gray-500">지도를 불러오는 중...</p>
        </div>
    ),
})

interface Gathering {
    id: number
    title: string
    latitude: number
    longitude: number
    image_url: string | null
    meet_at: string
}

export default function DynamicGatheringMap({ gatherings }: { gatherings: Gathering[] }) {
    return <GatheringMap gatherings={gatherings} />
}
