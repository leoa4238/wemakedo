import { Skeleton } from "@/components/ui/skeleton"

export function GatheringCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Image Placeholder */}
            <Skeleton className="aspect-[16/9] w-full" />

            <div className="p-4 space-y-4">
                {/* Title and Badge Placeholder */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Meta Info Placeholders */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            </div>
        </div>
    )
}
