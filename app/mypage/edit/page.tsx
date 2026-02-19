import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile from public.users
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fallback to auth metadata if public profile is empty (shouldn't happen due to trigger)
    const initialData = {
        name: profile?.name || user.user_metadata?.name || '',
        company: profile?.company || '',
        job_title: profile?.job_title || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 mr-2">
                        <Link href="/mypage">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            마이페이지로
                        </Link>
                    </Button>
                    <h1 className="text-lg font-bold">프로필 수정</h1>
                </div>
            </header>

            <main className="container mx-auto max-w-lg px-4 py-8">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <form action={updateProfile} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 dark:border-gray-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={initialData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="w-full">
                                <label htmlFor="avatar_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    프로필 이미지 URL
                                </label>
                                <input
                                    type="url"
                                    id="avatar_url"
                                    name="avatar_url"
                                    defaultValue={initialData.avatar_url}
                                    placeholder="https://..."
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    이미지 주소를 입력하세요. (추후 이미지 업로드 기능 제공 예정)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    닉네임 / 이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    defaultValue={initialData.name}
                                    required
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    회사 / 소속
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    defaultValue={initialData.company}
                                    placeholder="예: 판교 IT 기업"
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="job_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    직무 / 역할
                                </label>
                                <input
                                    type="text"
                                    id="job_title"
                                    name="job_title"
                                    defaultValue={initialData.job_title}
                                    placeholder="예: 기획자, 개발자, 마케터"
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            <Save className="mr-2 h-4 w-4" />
                            저장하기
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
