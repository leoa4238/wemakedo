import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black">
            <Header />

            <main className="container mx-auto max-w-4xl px-4 py-8">
                {/* Image Section Skeleton */}
                <Skeleton className="aspect-video w-full rounded-xl sm:aspect-[21/9]" />

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>

                        {/* Comments Skeleton */}
                        <div className="space-y-4 pt-8">
                            <Skeleton className="h-6 w-24" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-20 w-full rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <Skeleton className="h-5 w-5" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-48" />
                                </div>

                                <div className="flex items-start gap-3">
                                    <Skeleton className="h-5 w-5" />
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Skeleton className="h-12 w-full rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
