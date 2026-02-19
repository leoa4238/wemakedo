import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Button } from "./ui/button"
import { BackButton } from "./back-button"
import { UserNav } from "./user-nav"
import { MapPinned } from "lucide-react"

export async function Header() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <BackButton />
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
                        <img
                            src="/icon.png"
                            alt="WorkLife Logo"
                            className="h-8 w-8 rounded-lg object-cover shadow-sm"
                        />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">WorkLife</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-gray-600 dark:text-gray-300">
                        <Link href="/gatherings/map">
                            <MapPinned className="mr-2 h-4 w-4" />
                            지도보기
                        </Link>
                    </Button>

                    {user ? (
                        <UserNav user={user} />
                    ) : (
                        <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/login">로그인</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
