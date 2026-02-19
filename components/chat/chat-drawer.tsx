'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"
import { getMessages } from "@/app/gatherings/[id]/chat/actions"

interface User {
    id: string
    name: string | null
    avatar_url: string | null
}

interface ChatDrawerProps {
    gatheringId: number
    currentUser: User
}

export function ChatDrawer({ gatheringId, currentUser }: ChatDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [initialMessages, setInitialMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch messages when opening
    useEffect(() => {
        if (isOpen && initialMessages.length === 0) {
            setIsLoading(true)
            getMessages(gatheringId)
                .then((msgs) => {
                    setInitialMessages(msgs || [])
                })
                .catch(console.error)
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, gatheringId, initialMessages.length])

    return (
        <>
            {/* Trigger Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">채팅 열기</span>
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-900 sm:max-w-md ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
                        <h2 className="text-lg font-semibold">실시간 채팅</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        </div>
                    ) : (
                        <ChatMessageList
                            gatheringId={gatheringId}
                            initialMessages={initialMessages}
                            currentUser={currentUser}
                        />
                    )}

                    {/* Input */}
                    <ChatInput gatheringId={gatheringId} />
                </div>
            </div>
        </>
    )
}
