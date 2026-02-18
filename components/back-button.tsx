'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export function BackButton() {
    const router = useRouter()
    const pathname = usePathname()

    // 메인 페이지('/')에서는 뒤로가기 버튼 숨김
    if (pathname === '/') {
        return null
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
        >
            <ChevronLeft className="h-5 w-5" />
        </Button>
    )
}
