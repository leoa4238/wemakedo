import Link from "next/link"
import { getGatherings } from "./gatherings/actions"
import { GatheringCard } from "@/components/gathering-card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Plus } from "lucide-react"

export default async function Home() {
  const gatherings = await getGatherings()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            이번 주 모임
          </h1>
          <Button asChild className="hidden sm:flex">
            <Link href="/gatherings/new">
              <Plus className="mr-2 h-4 w-4" />
              모임 만들기
            </Link>
          </Button>
        </div>

        {gatherings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gatherings.map((gathering) => (
              <GatheringCard
                key={gathering.id}
                id={gathering.id}
                title={gathering.title}
                location={gathering.location}
                meet_at={gathering.meet_at}
                capacity={gathering.capacity}
                // @ts-ignore: participations is joined
                participant_count={gathering.participations[0]?.count || 0}
                image_url={gathering.image_url}
                category={gathering.category}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              아직 개설된 모임이 없어요
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              첫 번째 모임의 호스트가 되어보세요!
            </p>
            <Button asChild className="mt-6">
              <Link href="/gatherings/new">모임 만들기</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          asChild
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Link href="/gatherings/new">
            <Plus className="h-6 w-6" />
            <span className="sr-only">모임 만들기</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
