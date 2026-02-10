'use client'

import { createGathering } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function NewGatheringPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            const title = formData.get("title") as string
            const category = formData.get("category") as string
            const location = formData.get("location") as string
            const date = formData.get("date") as string
            const time = formData.get("time") as string
            const capacity = parseInt(formData.get("capacity") as string)
            const content = formData.get("content") as string
            const image_url = formData.get("image_url") as string

            // Combine date and time to ISO string
            const meet_at = new Date(`${date}T${time}`).toISOString()

            await createGathering({
                title,
                category,
                location,
                meet_at,
                capacity,
                content,
                image_url,
            })
        } catch (error) {
            console.error(error)
            alert("모임 생성 중 오류가 발생했습니다.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Client-side header won't manipulate cookies same way, but for MVP it's visually consistent enough if we reuse the server component structure or make Header a client component. 
          Actually Header is Server Component. We can use it here if this page was server component. 
          But this page needs client interaction. 
          Better approaches: 
          1. Make this page a Server Component that renders a Client Form.
          2. Just import the Server Header (it works in Next.js app router even if this page is client? No, parent can be server, children client. This page is page.tsx so it's the root of the route).
          Let's make a separate form component to keep page.tsx as Server Component.
      */}
            {/* Review: Next.js allows importing Server Components into Client Components? No. 
          So we should make the form a separate client component.
      */}
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                    새 모임 만들기
                </h1>

                <form action={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            모임 이름
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            placeholder="예: 강남역 직장인 독서모임"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            카테고리
                        </label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        >
                            <option value="networking">☕ 네트워킹/대화</option>
                            <option value="study">📚 스터디/자기개발</option>
                            <option value="workout">🏃 운동/액티비티</option>
                            <option value="meal">🍽 미식회/맛집탐방</option>
                        </select>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Date */}
                        <div className="space-y-2">
                            <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                날짜
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        {/* Time */}
                        <div className="space-y-2">
                            <label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                시간
                            </label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Location */}
                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                장소 (지역)
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                required
                                placeholder="예: 강남역, 판교 등"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <label htmlFor="capacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                모집 인원
                            </label>
                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                min="2"
                                max="20"
                                defaultValue="4"
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Image URL (Optional for MVP, can be text input) */}
                    <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            이미지 URL (선택)
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            placeholder="https://..."
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            상세 내용
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={5}
                            placeholder="모임에 대해 자세히 설명해주세요. (준비물, 진행 방식 등)"
                            className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    생성 중...
                                </>
                            ) : (
                                "모임 개설하기"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
