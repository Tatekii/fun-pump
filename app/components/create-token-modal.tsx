import { FC, useState } from "react"
import { formatEther } from "viem"
import { useCreateToken } from "../hooks/useContract"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { ResponsiveModal } from "./responsive-modal"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MAX_FILE_SIZE = 15 * 1024 // 15kb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

const formSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(32, "Name must be less than 32 characters")
			.regex(/^[a-zA-Z0-9 ]+$/, "Name can only contain letters, numbers and spaces"),
		symbol: z
			.string()
			.min(2, "Symbol must be at least 2 characters")
			.max(8, "Symbol must be less than 8 characters")
			.regex(/^[A-Z0-9]+$/, "Symbol must be uppercase letters and numbers only"),
		startTime: z
			.date({
				required_error: "Please select a start date",
			})
			.refine((date) => {
				return date > new Date()
			}, "Start date must be in the future"),
		endTime: z.date({
			required_error: "Please select an end date",
		}),
		image: z
			.custom<File>()
			.refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 15KB")
			.refine(
				(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
				"Only .jpg, .jpeg, .png and .gif formats are supported"
			),
	})
	.refine(
		(data) => {
			if (!data.startTime || !data.endTime) return false
			const startTimestamp = new Date(data.startTime).getTime() / 1000
			const endTimestamp = new Date(data.endTime).getTime() / 1000
			return endTimestamp > startTimestamp
		},
		{
			message: "End time must be after start time",
			path: ["endTime"],
		}
	)

interface CreateTokenModalProps {
	toggleCreate: () => void
	fee: bigint
	showCreate: boolean
}

const formDefaultValue = {
	name: "",
	symbol: "",
	startTime: (() => {
		const nextHour = new Date();
		nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0); // Next hour with 0 minutes and seconds
		return nextHour;
	})(),
	endTime: (() => {
		const nextDay = new Date();
		nextDay.setDate(nextDay.getDate() + 1);
		nextDay.setHours(nextDay.getHours() + 1, 0, 0, 0); // Same time next day
		return nextDay;
	})(),
	image: undefined,
}

const CreateTokenModal: FC<CreateTokenModalProps> = ({ toggleCreate, fee, showCreate }) => {
	const {
		createToken,
		isPending, // Wallet interaction
		isConfirming, // Transaction confirming
		isSuccess, // Transaction confirmed
		isError, // Transaction failed
		error, // Error details if any
		reset,
	} = useCreateToken()

	const [preview, setPreview] = useState<string>("")

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: formDefaultValue,
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true)
			const startTimestamp = Math.floor(new Date(values.startTime).getTime() / 1000)
			const endTimestamp = Math.floor(new Date(values.endTime).getTime() / 1000)

			// Upload image first
			const data = new FormData()
			data.set("file", values.image)
			const uploadRequest = await fetch("/api/files", {
				method: "POST",
				body: data,
			})
			const signedUrl = await uploadRequest.json()

			await createToken(values.name, values.symbol, startTimestamp, endTimestamp, signedUrl, fee)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Update button text based on transaction status
	const buttonText = isPending ? "Confirming..." : isConfirming ? "Creating..." : "Create Token"

	const handleClose = () => {
		reset()
		form.reset(formDefaultValue)
		setPreview("")
		toggleCreate()
	}

	return (
		<ResponsiveModal
			open={showCreate}
			onOpenChange={handleClose}
			title={"list new token"}
			description={`fee: ${formatEther(fee)} ETH`}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder="name" className="w-full p-6" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="symbol"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder="symbol" className="w-full p-6" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="image"
							render={({ field: { onChange, value, ...field } }) => (
								<FormItem>
									<FormLabel>Token Image</FormLabel>
									<FormControl>
										<div className="grid gap-4">
											<div className="relative">
												<Input
													type="file"
													accept="image/jpeg,image/png,image/gif"
													className="hidden"
													onChange={(e) => {
														const file = e.target.files?.[0]
														if (file) {
															onChange(file)
															const reader = new FileReader()
															reader.onload = (e) => {
																setPreview(e.target?.result as string)
															}
															reader.readAsDataURL(file)
														}
													}}
													{...field}
												/>
												<Button
													type="button"
													variant="outline"
													className="w-full"
													onClick={() => {
														const input = document.querySelector(
															'input[type="file"]'
														) as HTMLInputElement
														input?.click()
													}}
												>
													Choose Image
												</Button>
											</div>
											{preview && (
												<div className="relative aspect-square w-20 overflow-hidden rounded-lg">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img src={preview} alt="Preview" className="object-cover" />
												</div>
											)}
										</div>
									</FormControl>
									<FormDescription>
										Max file size: 15KB. Supported formats: JPG, PNG, GIF
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-4">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>Start Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP HH:mm")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < new Date()}
													initialFocus
												/>
												{field.value && (
													<div className="flex items-center gap-2 justify-center">
														<Label htmlFor="hours">Time:</Label>
														<Select
															onValueChange={(value) => {
																const newDate = new Date(field.value)
																newDate.setHours(parseInt(value), 0, 0)
																field.onChange(newDate)
															}}
															defaultValue={
																field.value ? field.value.getHours().toString() : "12"
															}
														>
															<SelectTrigger id="hours">
																<SelectValue placeholder="Select hour" />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 24 }, (_, i) => (
																	<SelectItem key={i} value={i.toString()}>
																		{i.toString().padStart(2, "0")}:00
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												)}
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>End Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP HH:mm")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < field.value}
													initialFocus
												/>
												{field.value && (
													<div className="flex items-center gap-2 justify-center">
														<Label htmlFor="hours">Time:</Label>
														<Select
															onValueChange={(value) => {
																const newDate = new Date(field.value)
																newDate.setHours(parseInt(value), 0, 0)
																field.onChange(newDate)
															}}
															defaultValue={
																field.value ? field.value.getHours().toString() : "12"
															}
														>
															<SelectTrigger id="hours">
																<SelectValue placeholder="Select hour" />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 24 }, (_, i) => (
																	<SelectItem key={i} value={i.toString()}>
																		{i.toString().padStart(2, "0")}:00
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												)}
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<div className="flex flex-col space-y-4">
						<Button
							type="submit"
							variant="ghost"
							className="text-2xl hover:scale-110 transition-transform"
							disabled={isPending || isSubmitting || isConfirming}
						>
							[ {buttonText} ]
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={handleClose}
							disabled={isSubmitting || isConfirming}
							className="text-2xl hover:scale-110 transition-transform"
						>
							[ cancel ]
						</Button>
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	)
}

export default CreateTokenModal
