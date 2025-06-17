import { FC, useState, useEffect, useCallback } from "react"
import { formatEther } from "viem"
import { useCreateToken } from "@/hooks/use-create-token"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/utils/tailwind.utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { ResponsiveModal } from "./responsive-modal"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"
import { CurveType } from "@fun-pump/smart-contract"
import { toast } from "sonner"

const MAX_FILE_SIZE = 15 * 1024 // 15kb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

export const formSchema = z
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
		curveType: z.nativeEnum(CurveType, {
			required_error: "Please select a curve type",
		}),
		curveSlope: z
			.string()
			.min(1, "Curve slope is required")
			.refine((val) => {
				const num = Number(val)
				return !isNaN(num) && num > 0
			}, "Curve slope must be a positive number"),
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
		const nextHour = new Date()
		nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0) // Next hour with 0 minutes and seconds
		return nextHour
	})(),
	endTime: (() => {
		const nextDay = new Date()
		nextDay.setDate(nextDay.getDate() + 1)
		nextDay.setHours(nextDay.getHours() + 1, 0, 0, 0) // Same time next day
		return nextDay
	})(),
	image: undefined as unknown as File,
	curveType: CurveType.LINEAR, // Default linear curve
	curveSlope: "1", // Default slope
}

const CreateTokenModal: FC<CreateTokenModalProps> = ({ toggleCreate, fee, showCreate }) => {
	const client = useQueryClient()

	const [preview, setPreview] = useState<string>("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// icon uploading
	const [isUploading, setIsUploading] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: formDefaultValue,
	})

	const {
		createToken,
		isSigningTransaction,
		isTransactionSubmitted,
		isWriteError,
		writeError,
		txHash,
		pendingTransactions,
		completedTokens,
		reset: resetCreateToken,
	} = useCreateToken()

	// 交易提交成功后200ms关闭弹窗
	useEffect(() => {
		if (isTransactionSubmitted) {
			handleClose()
		}
	}, [isTransactionSubmitted])

	// 新token完成后刷新列表
	useEffect(() => {
		if (completedTokens.length > 0) {
			client.invalidateQueries({ queryKey: ["tokens"] })
		}
	}, [completedTokens, client])

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true)
			const startTimestamp = Math.floor(new Date(values.startTime).getTime() / 1000)
			const endTimestamp = Math.floor(new Date(values.endTime).getTime() / 1000)

			// Upload image first
			const data = new FormData()
			data.set("file", values.image)

			let signedUrl = "debugUrl"

			// if (process.env.NODE_ENV !== "development") {
				signedUrl = await handleUploadIcon(data)
			// }

			// 将斜率转换为合适的单位
			const curveSlope = BigInt(Math.floor(Number(values.curveSlope) * 1e18))

			// 发送交易到区块链
			createToken(
				values.name,
				values.symbol,
				startTimestamp,
				endTimestamp,
				signedUrl,
				values.curveType,
				curveSlope,
				fee
			)
		} catch (error) {
			console.error("Error in form submission:", error)
			toast.error(error instanceof Error ? error.message : "An unknown error occurred")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleUploadIcon = useCallback(async (data: FormData) => {
		setIsUploading(true)
		try {
			const uploadRequest = await fetch("/api/files", {
				method: "POST",
				body: data,
			})

			if (!uploadRequest.ok) {
				throw new Error("Failed to upload image")
			}
			return await uploadRequest.json()
			// ... rest of your code
		} catch (error) {
			console.error(error)
		} finally {
			setIsUploading(false)
		}
	}, [])

	const handleClose = () => {
		resetCreateToken() // 重置交易状态
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
												<div className="relative aspect-square w-20 overflow-hidden rounded-lg mx-auto">
													<img
														src={preview}
														alt="Preview"
														className="object-cover w-full h-full"
													/>
													{isUploading && (
														<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
															<Loader2 className="h-5 w-5 animate-spin text-white" />
														</div>
													)}
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

						<div className="space-y-4 mt-4">
							<FormField
								control={form.control}
								name="curveType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bonding Curve Type</FormLabel>
										<Select
											onValueChange={(v) => field.onChange(+v)}
											defaultValue={field.value + ""}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select curve type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="0">Linear (y = mx)</SelectItem>
												<SelectItem value="1">Quadratic (y = mx²)</SelectItem>
												<SelectItem value="2">Exponential (y = m * 1.1^x)</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>Choose the curve type for token pricing</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="curveSlope"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Curve Slope Parameter</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.000001"
												min="0.000001"
												placeholder="Slope (e.g. 0.01)"
												{...field}
											/>
										</FormControl>
										<FormDescription>Higher values = steeper price increases</FormDescription>
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
							className={cn(
								"text-2xl hover:scale-110 transition-transform",
								isWriteError && "text-red-500",
								isSigningTransaction && "animate-pulse"
							)}
							disabled={isSubmitting || isSigningTransaction}
						>
							{isSigningTransaction ? "Signing Transaction..." : "Create Token"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={handleClose}
							disabled={isSubmitting || isSigningTransaction}
							className="text-2xl hover:scale-110 transition-transform"
						>
							[ cancel ]
						</Button>

						{/* 错误信息显示 */}
						{isWriteError && writeError && (
							<div className="text-red-500 text-sm text-center">{writeError.message}</div>
						)}
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	)
}

export default CreateTokenModal
