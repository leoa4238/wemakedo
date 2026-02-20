"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { LogOut, User as UserIcon, Settings } from "lucide-react"

interface UserNavProps {
    user: User
}

export function UserNav({ user }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const [mannerScore, setMannerScore] = useState<number>(36.5)

    useEffect(() => {
        async function fetchMannerScore() {
            const { data } = await supabase
                .from('users')
                .select('manner_score')
                .eq('id', user.id)
                .single()

            if (data?.manner_score) {
                setMannerScore(data.manner_score)
            }
        }
        fetchMannerScore()
    }, [user.id, supabase])

    const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User"

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={avatarUrl}
                    alt={userName}
                    className="h-full w-full object-cover"
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700 dark:ring-white dark:ring-opacity-10">
                    <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-orange-500">🌡️ {mannerScore.toFixed(1)}°C</span>
                            <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-300 to-red-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (mannerScore / 100) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="py-1">
                        <Link
                            href="/mypage"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <UserIcon className="mr-3 h-4 w-4" />
                            마이페이지
                        </Link>
                        <Link
                            href="/mypage/edit"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Settings className="mr-3 h-4 w-4" />
                            설정
                        </Link>
                    </div>
                    <div className="py-1">
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                로그아웃
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
