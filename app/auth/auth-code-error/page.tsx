import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                로그인 중 문제가 발생했습니다
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
                인증 코드를 교환하는 과정에서 오류가 발생했습니다.<br />
                잠시 후 다시 시도해주시거나 관리자에게 문의해주세요.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/">홈으로 가기</Link>
                </Button>
                <Button asChild>
                    <Link href="/login">다시 로그인하기</Link>
                </Button>
            </div>
        </div>
    )
}
