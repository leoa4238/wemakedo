'use client'

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"
import { getMessages } from "@/app/gatherings/[id]/chat/actions"
// Helper function to format timestamp
function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

interface User {
    id: string
    name: string | null
    avatar_url: string | null
}

interface Message {
    id: number
    content: string
    created_at: string
    user_id: string
    user?: User // Use optional chaining initially
}

interface ChatMessageListProps {
    gatheringId: number
    initialMessages: Message[]
    currentUser: User
}

export function ChatMessageList({
    gatheringId,
    initialMessages,
    currentUser
}: ChatMessageListProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [supabase] = useState(() => createClient())
    const channelRef = useRef<RealtimeChannel | null>(null)

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Subscribe to new messages
        channelRef.current = supabase
            .channel(`chat_gathering_${gatheringId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `gathering_id=eq.${gatheringId}`
                },
                async (payload) => {
                    console.log("Realtime event received:", payload) // Debug log
                    const newMessage = payload.new as Message

                    // Fetch user details for the new message sender
                    // Since Realtime only gives us the row data, we need to join manually or fetch
                    // For MVP, we can try to find user in existing messages or fetch lightweight profile

                    // Optimistic approach: if sender is me, I know my data.
                    // If others, we might need a quick fetch. 
                    // Let's implement a quick fetch for sender info if not present.

                    let sender: User | undefined;

                    if (newMessage.user_id === currentUser.id) {
                        sender = currentUser
                    } else {
                        // Check if we have this user in previous messages to reuse info
                        const existingMessage = messages.find(m => m.user_id === newMessage.user_id)
                        if (existingMessage?.user) {
                            sender = existingMessage.user
                        } else {
                            // Fetch user info - simple one-off query via RPC or from users table if public
                            const { data } = await supabase
                                .from('users')
                                .select('id, name, avatar_url')
                                .eq('id', newMessage.user_id)
                                .single()
                            if (data) sender = data as User
                        }
                    }

                    // Avoid duplicates just in case
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMessage.id)) return prev
                        return [...prev, { ...newMessage, user: sender }]
                    })
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status)
            })

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [gatheringId, supabase, currentUser, messages]) // Depend on messages to find cached users

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
                const isMe = message.user_id === currentUser.id
                const isContinuous = index > 0 && messages[index - 1].user_id === message.user_id

                return (
                    <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        {!isMe && !isContinuous && (
                            <div className="mr-2 h-8 w-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={message.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${message.user_id}`}
                                    alt={message.user?.name || "User"}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Empty spacer for continuous messages from others to align */}
                        {!isMe && isContinuous && <div className="w-10 shrink-0" />}

                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            {!isMe && !isContinuous && (
                                <span className="text-xs text-gray-500 ml-1 mb-1">
                                    {message.user?.name || "알 수 없음"}
                                </span>
                            )}
                            <div
                                className={`rounded-xl px-4 py-2 text-sm shadow-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 rounded-tl-none'
                                    }`}
                            >
                                {message.content}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {formatTime(message.created_at)}
                            </span>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}
