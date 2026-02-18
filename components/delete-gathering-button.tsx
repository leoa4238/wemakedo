'use client'

import { deleteGathering } from "@/app/gatherings/actions"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"

export function DeleteGatheringButton({ gatheringId }: { gatheringId: number }) {
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('정말 모임을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteGathering(gatheringId)
        } catch (error) {
            console.error(error)
            alert('모임 삭제에 실패했습니다.')
            setIsDeleting(false)
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
        >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            모임 삭제
        </Button>
    )
}
