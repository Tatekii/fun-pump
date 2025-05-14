import { FC, useState } from "react"
import { formatEther } from "viem"
import { useCreateToken } from "../hooks/useContract"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

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

interface ListProps {
	toggleCreate: () => void
	fee: bigint
}

const List: FC<ListProps> = ({ toggleCreate, fee }) => {
	const { createToken } = useCreateToken()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			symbol: "",
			startTime: new Date(),
			endTime: new Date(),
		},
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true)
			const startTimestamp = Math.floor(new Date(values.startTime).getTime() / 1000)
			const endTimestamp = Math.floor(new Date(values.endTime).getTime() / 1000)

			await createToken(values.name, values.symbol, startTimestamp, endTimestamp, fee)
			toggleCreate()
		} catch (error) {
			console.error("Failed to create token:", error)
			// You might want to show an error toast here
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={true} onOpenChange={toggleCreate}>
			<DialogContent className="backdrop-blur-sm">
				<DialogHeader>
					<DialogTitle className="text-4xl text-center">list new token</DialogTitle>
					<DialogDescription className="text-lg text-center">fee: {formatEther(fee)} ETH</DialogDescription>
				</DialogHeader>

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
								disabled={isSubmitting}
							>
								[ {isSubmitting ? "creating..." : "list"} ]
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
				</Form>
			</DialogContent>
		</Dialog>
	)
}

export default List
