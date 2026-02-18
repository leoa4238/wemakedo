'use client'

import { createGathering } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Calendar, Loader2, MapPin, Search, Users, ArrowLeft } from "lucide-react"
import DaumPostcode from 'react-daum-postcode';
import Image from "next/image"

export default function CreateGatheringForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [isPreview, setIsPreview] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("networking")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [location, setLocation] = useState("")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [capacity, setCapacity] = useState("4")
    const [imageUrl, setImageUrl] = useState("")
    const [content, setContent] = useState("")

    // [주소 검색 완료 핸들러]
    const handleComplete = async (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setLocation(fullAddress);
        setIsAddressModalOpen(false);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`, {
                headers: {
                    'User-Agent': 'WebGatheringApp/1.0'
                }
            });
            const result = await response.json();
            if (result && result.length > 0) {
                setLatitude(parseFloat(result[0].lat));
                setLongitude(parseFloat(result[0].lon));
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (!location) {
                alert("장소를 선택해주세요.");
                setIsSubmitting(false);
                return;
            }

            const meet_at = new Date(`${date}T${time}`).toISOString()

            await createGathering({
                title,
                category,
                location,
                meet_at,
                capacity: parseInt(capacity),
                content,
                image_url: imageUrl,
                latitude: latitude || undefined,
                longitude: longitude || undefined
            })
        } catch (error) {
            console.error(error)
            alert("모임 생성 중 오류가 발생했습니다.")
            setIsSubmitting(false)
        }
    }

    // Helper to get category label
    const getCategoryLabel = (value: string) => {
        switch (value) {
            case "networking": return "☕ 네트워킹/대화";
            case "study": return "📚 스터디/자기개발";
            case "workout": return "🏃 운동/액티비티";
            case "meal": return "🍽 미식회/맛집탐방";
            default: return "기타";
        }
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                새 모임 만들기
            </h1>

            {isPreview ? (
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white">미리보기</h2>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                실제 화면 예시
                            </span>
                        </div>

                        {/* Preview Content */}
                        <div className="space-y-6">
                            {/* Image Section */}
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <span className="text-4xl">🏢</span>
                                    </div>
                                )}
                                <div className="absolute left-4 top-4 z-20">
                                    <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                                        {getCategoryLabel(category)}
                                    </span>
                                </div>
                            </div>

                            {/* Title & Info */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {title || "모임 이름"}
                                </h1>
                                <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {date} {time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{location || "장소 미정"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>정원 {capacity}명</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-blue max-w-none dark:prose-invert">
                                <h3 className="text-lg font-semibold">모임 소개</h3>
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                                    {content}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPreview(false)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            수정하기
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    생성 중...
                                </>
                            ) : (
                                "이대로 개설하기"
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            모임 이름
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
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
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Location with Address Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            장소 (주소 검색)
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    readOnly
                                    value={location}
                                    placeholder="주소 검색을 클릭하세요"
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="flex h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <Button type="button" onClick={() => setIsAddressModalOpen(true)} variant="secondary">
                                <Search className="h-4 w-4 mr-2" />
                                검색
                            </Button>
                        </div>
                        {latitude && longitude && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ 위치 좌표 확인됨
                            </p>
                        )}
                        {/* Modal for Address Search */}
                        {isAddressModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden dark:bg-gray-800">
                                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold dark:text-white">주소 검색</h3>
                                        <button type="button" onClick={() => setIsAddressModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
                                    </div>
                                    <div className="h-[400px]">
                                        <DaumPostcode onComplete={handleComplete} className="h-full" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                        <label htmlFor="capacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            모집 인원
                        </label>
                        <input
                            type="number"
                            id="capacity"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="2"
                            max="20"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Image URL (Optional for MVP, can be text input) */}
                    <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            이미지 URL (선택)
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
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
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={5}
                            placeholder="모임에 대해 자세히 설명해주세요. (준비물, 진행 방식 등)"
                            className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPreview(true)}>
                            미리보기
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
            )}
        </div>
    )
}
