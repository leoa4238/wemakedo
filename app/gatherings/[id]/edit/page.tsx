import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import CreateGatheringForm from "@/components/create-gathering-form"
import { getGathering } from "@/app/gatherings/actions"
import { BackButton } from "@/components/back-button"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditGatheringPage({ params }: PageProps) {
    const { id } = await params
    const gatheringId = parseInt(id)

    if (isNaN(gatheringId)) {
        notFound()
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?next=/gatherings/${id}/edit`)
    }

    // Fetch gathering data
    // reusing getGathering from actions, but it returns a complex object.
    // I can also just fetch raw data here if I want specific fields, but getGathering is fine.
    const gathering = await getGathering(gatheringId)

    if (!gathering) {
        notFound()
    }

    // Check host permission
    if (gathering.host_id !== user.id) {
        return (
            <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-bold">접근 권한이 없습니다</h1>
                <p className="mt-2 text-gray-600">이 모임을 수정할 권한이 없습니다.</p>
                <div className="mt-4">
                    <BackButton />
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <div className="mr-4">
                        <BackButton />
                    </div>
                    <h1 className="text-lg font-bold">모임 수정</h1>
                </div>
            </header>

            <main className="container mx-auto py-8">
                <CreateGatheringForm
                    initialData={{
                        title: gathering.title,
                        category: gathering.category || "networking",
                        meet_at: gathering.meet_at,
                        location: gathering.location,
                        latitude: gathering.latitude,
                        longitude: gathering.longitude,
                        capacity: gathering.capacity,
                        image_url: gathering.image_url,
                        content: gathering.content
                    }}
                    gatheringId={gatheringId}
                    mode="edit"
                />
            </main>
        </div>
    )
}
