import { getGatherings, GatheringFilters } from "./gatherings/actions"
import { GatheringList } from "@/components/gathering-list"
import { GatheringCard } from "@/components/gathering-card"
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

  const isSearching = !!(filters.category || filters.query || filters.status)

  // Fetch data
  const mainGatherings = await getGatherings(filters)
  // Only fetch new gatherings if not searching
  const newGatherings = !isSearching ? await getGatherings({ limit: 4 }) : []

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {!isSearching && (
          <>
            {/* Hero Section */}
            <section className="relative mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-16 text-center shadow-xl md:px-12 md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="space-y-4 max-w-2xl text-white">
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                    퇴근 후 설레는 <br />
                    <span className="text-blue-200">새로운 만남</span>
                  </h1>
                  <p className="text-lg text-blue-100 md:text-xl">
                    관심사로 연결되는 직장인 소모임 커뮤니티.<br className="hidden md:block" />
                    지금 내 주변의 멋진 동료들을 만나보세요.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-4 md:justify-start">
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      <Link href="/gatherings/new">모임 만들기</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-blue-300 bg-transparent text-white hover:bg-blue-500/20 hover:text-white">
                      <Link href="/gatherings/map">
                        <MapPin className="mr-2 h-4 w-4" />
                        지도보며 찾기
                      </Link>
                    </Button>
                  </div>
                </div>
                {/* Decorative Element */}
                <div className="hidden md:block">
                  <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shadow-inner animate-in zoom-in duration-1000 delay-300">
                    <div className="text-9xl">🤝</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recommended (New) Section */}
            <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">따끈따끈한 신규 모임 🔥</h2>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">방금 개설된 흥미로운 모임들을 확인해보세요.</p>
                </div>
              </div>

              {newGatherings && newGatherings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {newGatherings.map((gathering) => (
                    <GatheringCard
                      key={gathering.id}
                      id={gathering.id}
                      title={gathering.title}
                      location={gathering.location}
                      meet_at={gathering.meet_at}
                      capacity={gathering.capacity}
                      // @ts-ignore
                      participant_count={gathering.participations?.[0]?.count || 0}
                      image_url={gathering.image_url}
                      category={gathering.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500 dark:border-gray-800">
                  아직 등록된 신규 모임이 없습니다.
                </div>
              )}
            </section>
          </>
        )}

        {/* Main List Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {!isSearching && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">전체 모임 탐색 🔍</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">다양한 카테고리의 모임을 찾아보세요.</p>
            </div>
          )}

          {/* Search & Filters */}
          <SearchFilters />

          {/* Gathering List */}
          <GatheringList initialGatherings={mainGatherings} />
        </section>
      </main>
    </div>
  )
}
