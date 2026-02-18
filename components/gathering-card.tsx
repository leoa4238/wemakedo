import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"

type GatheringCardProps = {
    id: number
    title: string
    location: string
    meet_at: string
    capacity: number
    participant_count?: number
    image_url?: string | null
    category?: string | null
}

export function GatheringCard({
    id,
    title,
    location,
    meet_at,
    capacity,
    participant_count = 0,
    image_url,
    category,
}: GatheringCardProps) {
    const dateObj = new Date(meet_at)
    const dateStr = dateObj.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
    })
    const timeStr = dateObj.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    })

    const isEnded = new Date() > dateObj

    return (
        <Link
            href={`/gatherings/${id}`}
            className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
        >
            <div className={`relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 ${isEnded ? 'grayscale' : ''}`}>
                {image_url ? (
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <span className="text-4xl">🏢</span>
                    </div>
                )}
                {isEnded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <span className="transform -rotate-12 rounded-lg border-2 border-white px-4 py-1 text-lg font-bold text-white shadow-lg">
                            종료됨
                        </span>
                    </div>
                )}
                {category && (
                    <div className="absolute left-3 top-3 z-20 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                        {category}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className={`line-clamp-2 text-lg font-bold ${isEnded ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'}`}>
                    {title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                            {dateStr} · {timeStr}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                            {participant_count}/{capacity}명 참여
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
