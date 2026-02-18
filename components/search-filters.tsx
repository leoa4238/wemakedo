'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

// [검색 및 필터 컴포넌트]
// 카테고리 선택, 모집 상태 필터, 검색어 입력을 처리하고 URL 쿼리 파라미터를 업데이트합니다.
export function SearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // URL 파라미터에서 초기값 가져오기
    const initialCategory = searchParams.get('category') || 'all'
    const initialQuery = searchParams.get('query') || ''
    const initialStatus = searchParams.get('status') === 'open' // 'open'일 때만 true

    const [category, setCategory] = useState(initialCategory)
    const [query, setQuery] = useState(initialQuery)
    const [isOpenOnly, setIsOpenOnly] = useState(initialStatus)

    // 검색어 디바운스 (입력 멈춘 후 500ms 뒤에 적용)
    const [debouncedQuery] = useDebounce(query, 500)

    // 필터 변경 시 URL 업데이트
    useEffect(() => {
        const params = new URLSearchParams()

        if (category && category !== 'all') {
            params.set('category', category)
        }
        if (debouncedQuery) {
            params.set('query', debouncedQuery)
        }
        if (isOpenOnly) {
            params.set('status', 'open')
        }

        router.push(`/?${params.toString()}`)
    }, [category, debouncedQuery, isOpenOnly, router])

    return (
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center">
            {/* 1. 카테고리 선택 */}
            <div className="w-full md:w-[180px]">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="문화/예술">문화/예술</SelectItem>
                        <SelectItem value="운동/액티비티">운동/액티비티</SelectItem>
                        <SelectItem value="푸드/드링크">푸드/드링크</SelectItem>
                        <SelectItem value="취미">취미</SelectItem>
                        <SelectItem value="여행">여행</SelectItem>
                        <SelectItem value="성장/자기계발">성장/자기계발</SelectItem>
                        <SelectItem value="동네/친목">동네/친목</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 2. 검색어 입력 */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="모임 이름이나 내용을 검색해보세요"
                    className="pl-10"
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
            </div>

            {/* 3. 모집 중만 보기 토글 버튼 */}
            <Button
                variant={isOpenOnly ? "default" : "outline"}
                onClick={() => setIsOpenOnly(!isOpenOnly)}
                className="whitespace-nowrap"
            >
                {isOpenOnly ? "모집 중만" : "모든 모임"}
            </Button>
        </div>
    )
}
