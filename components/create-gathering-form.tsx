'use client'

import { createGathering } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, MapPin, Search } from "lucide-react"
import DaumPostcode from 'react-daum-postcode';

export default function CreateGatheringForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

    // Location State
    const [location, setLocation] = useState("")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)

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

        // Geocoding (Address -> Coordinates) using Nominatim (OpenStreetMap)
        try {
            // User-Agent is required by OSM Nominatim policy
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
            // Continue without coordinates if geocoding fails
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            if (!location) {
                alert("장소를 선택해주세요.");
                setIsSubmitting(false);
                return;
            }

            const title = formData.get("title") as string
            const category = formData.get("category") as string
            // location is already in state
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
                location, // Use state
                meet_at,
                capacity,
                content,
                image_url,
                latitude: latitude || undefined, // Use state
                longitude: longitude || undefined // Use state
            })
        } catch (error) {
            console.error(error)
            alert("모임 생성 중 오류가 발생했습니다.")
            setIsSubmitting(false)
        }
    }

    return (
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
                        name="capacity"
                        min="2"
                        max="20"
                        defaultValue="4"
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
    )
}
