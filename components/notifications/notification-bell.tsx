'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUnreadNotifications, markAsRead, markAllAsRead } from '@/app/notifications/actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Notification = {
    id: number
    user_id: string
    type: string
    content: string
    link_url: string | null
    is_read: boolean
    created_at: string
}

export function NotificationBell({ userId }: { userId?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        const fetchInitial = async () => {
            const data = await getUnreadNotifications()
            if (data && data.length > 0) {
                // @ts-ignore
                setNotifications(data)
                setUnreadCount(data.length)
            }
        }

        fetchInitial()

        // Realtime Subscription
        const channel = supabase
            .channel(`notifications:user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications((prev) => [newNotif, ...prev])
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id)
            setNotifications(prev => prev.filter(n => n.id !== notif.id))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }

        setIsOpen(false)
        if (notif.link_url) {
            router.push(notif.link_url)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setNotifications([])
        setUnreadCount(0)
        setIsOpen(false)
    }

    if (!userId) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="알림"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-xl ring-1 ring-black/5 focus:outline-none dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            새 알림
                        </h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <Check className="h-3 w-3" />
                                모두 읽음
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto w-full">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className="flex flex-col items-start gap-1 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 last:border-0 dark:border-gray-800/50 dark:hover:bg-gray-800/50 w-full"
                                    >
                                        <div className="flex w-full items-start justify-between">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
                                                {notif.content}
                                            </span>
                                            {/* Unread indicator dot */}
                                            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(notif.created_at).toLocaleString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-3 px-4 py-8 text-center">
                                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    새로운 알림이 없습니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
