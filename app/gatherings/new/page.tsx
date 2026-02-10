import CreateGatheringForm from "@/components/create-gathering-form"
import { Header } from "@/components/header"

export default function NewGatheringPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
            <Header />
            <CreateGatheringForm />
        </div>
    )
}
