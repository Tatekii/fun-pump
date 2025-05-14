import { FC } from "react"
import { formatEther } from "viem"
import { useCreateToken } from "../hooks/useContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ListProps {
	toggleCreate: () => void
	fee: bigint
}

const List: FC<ListProps> = ({ toggleCreate, fee }) => {
	const { createToken } = useCreateToken()

	async function listHandler(formData: FormData) {
		const name = formData.get("name") as string
		const ticker = formData.get("ticker") as string

		if (!name || !ticker) return

		await createToken(name, ticker, fee)
		toggleCreate()
	}

	return (
		<Dialog open={true} onOpenChange={toggleCreate}>
			<DialogContent className="backdrop-blur-sm">
				<DialogHeader>
					<DialogTitle className="text-4xl text-center">list new token</DialogTitle>
					<DialogDescription className="text-lg text-center">
						fee: {formatEther(fee)} ETH
					</DialogDescription>
				</DialogHeader>

				<form action={listHandler} className="space-y-6">
					<div className="space-y-4">
						<Input
							type="text"
							name="name"
							placeholder="name"
							required
							className="w-full p-6"
						/>
						<Input
							type="text"
							name="ticker"
							placeholder="ticker"
							required
							className="w-full p-6"
						/>
					</div>
					<div className="flex flex-col space-y-4">
						<Button 
							type="submit"
							variant="ghost" 
							className="text-2xl hover:scale-110 transition-transform"
						>
							[ list ]
						</Button>
						<Button 
							type="button"
							variant="ghost"
							onClick={toggleCreate}
							className="text-2xl hover:scale-110 transition-transform"
						>
							[ cancel ]
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default List
