import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Button } from "./ui/button"
import { BackButton } from "./back-button"

export async function Header() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <BackButton />
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            W
                        </div>
                        <span>WorkLife</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <form action="/auth/signout" method="post">
                                <Button variant="ghost" size="sm">
                                    로그아웃
                                </Button>
                            </form>
                            <Link href="/mypage">
                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden hover:opacity-80 transition-opacity">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <Button asChild variant="default" size="sm">
                            <Link href="/login">로그인</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
