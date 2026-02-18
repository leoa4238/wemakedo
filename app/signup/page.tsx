'use client'

import { signup } from '@/app/login/actions'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        const result = await signup(formData)

        if (result?.error) {
            setMessage(`오류: ${result.error}`)
        } else if (result?.success) {
            setMessage('이메일 확인 링크가 전송되었습니다. 이메일을 확인해주세요!')
        }

        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900">
            <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        회원가입
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        직장인 소모임을 시작해보세요
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">이름 (닉네임)</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                placeholder="이름 (닉네임)"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">이메일 주소</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                placeholder="이메일 주소"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                minLength={6}
                                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                placeholder="비밀번호 (6자 이상)"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`text-sm text-center ${message.includes('오류') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="flex w-full justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    가입 중...
                                </>
                            ) : (
                                "가입하기"
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">이미 계정이 있으신가요? </span>
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    )
}
