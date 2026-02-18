import { getGatherings, GatheringFilters } from "./gatherings/actions"
import { GatheringList } from "@/components/gathering-list"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { SearchFilters } from "@/components/search-filters"
import Link from "next/link"
import { MapPin } from "lucide-react"

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams

  const filters: GatheringFilters = {
    category: typeof params.category === 'string' ? params.category : undefined,
    query: typeof params.query === 'string' ? params.query : undefined,
    status: params.status === 'open' ? 'open' : undefined,
  }

  const gatherings = await getGatherings(filters)

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero & Actions */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              내 주변 소모임 찾기
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              관심사 맞는 동네 친구들과 함께 즐거운 시간을 보내세요!
            </p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Button asChild className="flex-1 md:flex-none" variant="outline">
              <Link href="/gatherings/map">
                <MapPin className="mr-2 h-4 w-4" />
                지도보며 찾기
              </Link>
            </Button>
            <Button asChild className="flex-1 md:flex-none">
              <Link href="/gatherings/new">모임 만들기</Link>
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilters />

        {/* Gathering List (Client Component for Distance Sorting) */}
        <GatheringList initialGatherings={gatherings} />
      </main>
    </div>
  )
}
