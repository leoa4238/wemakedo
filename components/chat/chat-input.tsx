'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { sendMessage } from "@/app/gatherings/[id]/chat/actions"

interface ChatInputProps {
    gatheringId: number
}

export function ChatInput({ gatheringId }: ChatInputProps) {
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isSending) return

        setIsSending(true)
        try {
            await sendMessage(gatheringId, message)
            setMessage("")
        } catch (error) {
            console.error(error)
            alert("메시지 전송에 실패했습니다.")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 min-h-[40px] rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isSending}
            />
            <Button
                type="submit"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                disabled={!message.trim() || isSending}
            >
                {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
            </Button>
        </form>
    )
}
