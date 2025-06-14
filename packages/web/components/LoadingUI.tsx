import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoadingUI() {
    return (
        <main className="col-[2/12] grid grid-cols-12 text-center">
            <div className="col-span-full place-content-center min-h-[30svh]">
                <Button
                    variant="ghost"
                    disabled
                    className="text-2xl"
                >
                    Loading...
                </Button>
            </div>
            <div className="col-span-full">
                <CardHeader>
                    <CardTitle className="font-extrabold">Token List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,0fr))] gap-4 place-content-center text-center">
                        <p className="col-span-full text-2xl">Loading...</p>
                    </div>
                </CardContent>
            </div>
        </main>
    )
}
