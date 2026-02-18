import { GatheringCardSkeleton } from "@/components/skeletons/gathering-card-skeleton"
import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />

            <main className="container mx-auto max-w-5xl px-4 py-8">
                {/* Profile Section Skeleton */}
                <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="mx-auto h-8 w-48" />
                        <Skeleton className="mx-auto h-4 w-32" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="mb-8 flex justify-center border-b border-gray-200 dark:border-gray-800">
                    <div className="flex space-x-8 pb-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <GatheringCardSkeleton key={i} />
                    ))}
                </div>
            </main>
        </div>
    )
}
