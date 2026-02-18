import { getGatherings } from "../actions"
import { Header } from "@/components/header"
import DynamicGatheringMap from "@/components/dynamic-gathering-map"

export const dynamic = 'force-dynamic'

export default async function MapPage() {
    // 모든 모임 가져오기 (필터 없이)
    const gatherings = await getGatherings()

    // 좌표가 있는 모임만 필터링
    const gatheringsWithLocation = gatherings.filter(
        (g) => g.latitude && g.longitude
    )

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />
            <main className="flex-1 relative">
                <DynamicGatheringMap gatherings={gatheringsWithLocation} />
            </main>
        </div>
    )
}
