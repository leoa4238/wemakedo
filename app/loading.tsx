import { GatheringCardSkeleton } from "@/components/skeletons/gathering-card-skeleton"
import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Skeleton */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex w-full gap-2 md:w-auto">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Filter Skeleton */}
                <div className="mb-8 h-16 w-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-[180px]" />
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <GatheringCardSkeleton key={i} />
                    ))}
                </div>
            </main>
        </div>
    )
}
