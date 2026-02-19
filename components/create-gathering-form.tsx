'use client'

import { createGathering, updateGathering } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Calendar, Loader2, MapPin, Search, Users, ArrowLeft } from "lucide-react"
import DaumPostcode from 'react-daum-postcode';
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CATEGORIES, getCategoryLabel } from "@/lib/constants"

interface CreateGatheringFormProps {
    initialData?: {
        title: string
        category: string
        meet_at: string
        location: string
        latitude: number | null
        longitude: number | null
        capacity: number
        image_url: string | null
        content: string | null
    }
    gatheringId?: number
    mode?: 'create' | 'edit'
}

export default function CreateGatheringForm({
    initialData,
    gatheringId,
    mode = 'create'
}: CreateGatheringFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [isPreview, setIsPreview] = useState(false)

    // Form State
    // Initialize date and time from meet_at if available
    const initialDate = initialData?.meet_at ? new Date(initialData.meet_at).toISOString().split('T')[0] : ""
    const initialTime = initialData?.meet_at ? new Date(initialData.meet_at).toTimeString().slice(0, 5) : ""

    // Form State
    const [title, setTitle] = useState(initialData?.title || "")
    const [category, setCategory] = useState(initialData?.category || "networking")
    const [date, setDate] = useState(initialDate)
    const [time, setTime] = useState(initialTime)
    const [location, setLocation] = useState(initialData?.location || "")
    const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null)
    const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null)
    const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || "4")
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")
    const [content, setContent] = useState(initialData?.content || "")

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

    const router = useRouter()

    // [Tags Logic]
    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState<string[]>([])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const newTag = tagInput.trim().replace(/^#/, '')
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
            }
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    // [Image Presets]
    const imagePresets = [
        { name: "열정 (Red)", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80", color: "bg-red-100" },
        { name: "차분 (Blue)", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", color: "bg-blue-100" },
        { name: "자연 (Green)", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80", color: "bg-green-100" },
        { name: "감성 (Purple)", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", color: "bg-purple-100" },
        { name: "맛집 (Orange)", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", color: "bg-orange-100" },
    ]

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

            // Append tags to content if they exist
            let finalContent = content;
            if (tags.length > 0) {
                finalContent += `\n\n` + tags.map(t => `#${t}`).join(" ");
            }

            // Use first preset if no image provided? Or let it be empty.
            // If user clicked a preset, imageUrl is set.

            if (mode === 'edit' && gatheringId) {
                await updateGathering(gatheringId, {
                    title,
                    category,
                    location,
                    meet_at,
                    capacity: parseInt(capacity),
                    content: finalContent,
                    image_url: imageUrl,
                    latitude: latitude || undefined,
                    longitude: longitude || undefined
                })
                router.push(`/gatherings/${gatheringId}`)
            } else {
                const result = await createGathering({
                    title,
                    category,
                    location,
                    meet_at,
                    capacity: parseInt(capacity),
                    content: finalContent,
                    image_url: imageUrl,
                    latitude: latitude || undefined,
                    longitude: longitude || undefined
                })
                router.push(`/gatherings/${result.id}`)
            }
        } catch (error) {
            console.error(error)
            alert("모임 생성 중 오류가 발생했습니다.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {mode === 'edit' ? "모임 수정하기" : "어떤 모임을 만드시겠어요?"}
            </h1>
            <p className="mb-8 text-gray-500">멋진 동료들과 함께할 시간을 계획해보세요.</p>

            {isPreview ? (
                <div className="space-y-6">
                    {/* ... Preview Code Stub - Keeping logic same but structure might need adjustment if I deleted imports... */}
                    {/* Wait, I replaced the whole file content from handleSubmit downwards so I need to make sure I don't break functionality. */}
                    {/* The complexity says 3, so I should be careful. I will assume the previous preview code is mostly fine but I am rewriting the whole return block. */}

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white">미리보기</h2>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                실제 화면 예시
                            </span>
                        </div>
                        {/* Preview Content Reuse */}
                        <div className="space-y-6">
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400"><span className="text-4xl">🏢</span></div>
                                )}
                                <div className="absolute left-4 top-4 z-20">
                                    <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                                        {getCategoryLabel(category)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title || "모임 이름"}</h1>
                                <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> <span>{date} {time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> <span>{location || "장소 미정"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" /> <span>정원 {capacity}명</span>
                                    </div>
                                </div>
                                {tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="prose prose-blue max-w-none dark:prose-invert">
                                <h3 className="text-lg font-semibold">모임 소개</h3>
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">{content}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPreview(false)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> 수정하기
                        </Button>
                        <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</> : "이대로 개설하기"}
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* 1. Category Selection */}
                    <div className="space-y-4">
                        <label className="text-lg font-semibold text-gray-900 dark:text-white">1. 주제를 선택해주세요</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${category === cat.id
                                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2 dark:bg-blue-900/20 dark:ring-offset-gray-950"
                                            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                                        }`}
                                >
                                    <span className="text-3xl">{cat.icon}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center break-words w-full">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Basic Info (Title & Tags) */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2. 기본 정보</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">모임 이름</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="예: 강남역 직장인 독서모임 (15자 이내 추천)"
                                    className="flex h-12 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-base placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">태그 (선택)</label>
                                <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 bg-transparent p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700">
                                    {tags.map((tag) => (
                                        <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                            #{tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-900">×</button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={tags.length === 0 ? "태그 입력 후 엔터 (예: #초보환영 #뒷풀이)" : ""}
                                        className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Date & Location & Capacity */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3. 언제 만날까요?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">날짜</label>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">시간</label>
                                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">4. 모집 인원</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">최대 인원 (본인 포함)</label>
                                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="2" max="20" required className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">5. 어디서 만날까요?</h3>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input type="text" readOnly value={location} placeholder="주소 검색을 클릭하세요" onClick={() => setIsAddressModalOpen(true)} className="flex h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                                </div>
                                <Button type="button" onClick={() => setIsAddressModalOpen(true)} variant="secondary"><Search className="h-4 w-4 mr-2" />검색</Button>
                            </div>
                            {latitude && longitude && <p className="text-xs text-green-600 dark:text-green-400">✓ 위치 좌표 확인됨</p>}
                        </div>
                    </div>

                    {/* Image Presets & URL */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">6. 대표 이미지</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">추천 이미지 선택 (Atmosphere)</label>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {imagePresets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setImageUrl(preset.url)}
                                            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${imageUrl === preset.url ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2" : "border-transparent opacity-70 hover:opacity-100"
                                                }`}
                                        >
                                            <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-medium text-white shadow-sm">
                                                {preset.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 dark:bg-gray-900">또는</span></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">직접 이미지 URL 입력</label>
                                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">7. 상세 내용</h3>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={5} placeholder="모임에 대해 자세히 설명해주세요. (준비물, 진행 방식 등)" className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white" />
                    </div>

                    {/* Submit Actions */}
                    <div className="sticky bottom-4 z-40 bg-white/80 p-4 rounded-xl shadow-lg border border-gray-100 backdrop-blur-md dark:bg-black/80 dark:border-gray-800">
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPreview(true)}>미리보기</Button>
                            <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</> : mode === 'edit' ? "수정하기" : "모임 개설하기"}
                            </Button>
                        </div>
                    </div>
                </form>
            )}

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
    )
}
