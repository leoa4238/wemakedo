import Link from "next/link"
import { getGatherings } from "./gatherings/actions"
import { GatheringList } from "@/components/gathering-list"
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

        <GatheringList initialGatherings={gatherings} />

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
