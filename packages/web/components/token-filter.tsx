"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAtom, useSetAtom } from "jotai"
import { filterAtom } from "@/stores/filter.atom"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/utils/tailwind.utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { timeFilterOptions, TTimeFilter } from "@/utils/tokens.utils"

const filterFormSchema = z.object({
	name: z.string().optional(),
	startTime: z
		.object({
			type: z.enum(timeFilterOptions),
			date: z.date(),
		})
		.optional(),
	endTime: z
		.object({
			type: z.enum(timeFilterOptions),
			date: z.date(),
		})
		.optional(),
})

export type FilterFormValues = z.infer<typeof filterFormSchema>

export function TokenFilterComponent() {
	const setFilter = useSetAtom(filterAtom)
	const form = useForm<FilterFormValues>({
		resolver: zodResolver(filterFormSchema),
	})

	const onSubmit = (data: FilterFormValues) => {
		const newFilter: FilterFormValues = {}

		if (data.name) {
			newFilter.name = data.name
		}
		if (data.startTime) {
			newFilter.startTime = {
				type: data.startTime.type,
				date: data.startTime.date,
			}
		}
		if (data.endTime) {
			newFilter.endTime = {
				type: data.endTime.type,
				date: data.endTime.date,
			}
		}

		setFilter(newFilter)
	}

	const handleClearFilter = () => {
		form.reset({
			name: "",
			startTime: undefined,
			endTime: undefined,
		})
		setFilter({})
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex items-center gap-2 p-2 border rounded-lg justify-center"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="flex">
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Search by name..." className="w-[200px]" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex items-center gap-4">
					<FormField
						control={form.control}
						name="startTime"
						render={({ field }) => (
							<FormItem className="flex">
								<FormLabel>Start Time</FormLabel>

								<div className="flex gap-2">
									<Select
										value={field.value?.type || "equals"}
										onValueChange={(value) => {
											field.onChange({
												type: value as TTimeFilter,
												date: field.value?.date || new Date(),
											})
										}}
									>
										<SelectTrigger className="w-[120px]">
											<SelectValue placeholder="Select comparison" />
										</SelectTrigger>
										<SelectContent>
											{timeFilterOptions.map((op) => (
												<SelectItem value={op} key={op}>
													{op.toUpperCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														"pl-3 text-left font-normal m-0",
														!field.value?.date && "text-muted-foreground"
													)}
												>
													{field.value?.date ? (
														<span>{format(field.value.date, "yyyy/MM/dd")} </span>
													) : (
														"Start Time"
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent>
											<Calendar
												mode="single"
												selected={field?.value?.date}
												onSelect={(date) => {
													if (date) {
														field.onChange({
															type: field?.value?.type || "equals",
															date,
														})
													}
												}}
												className="rounded-md border"
											/>
										</PopoverContent>
									</Popover>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="endTime"
						render={({ field }) => (
							<FormItem className="flex">
								<FormLabel>End Time</FormLabel>
								<div className="flex gap-2">
									<Select
										value={field.value?.type || "equals"}
										onValueChange={(value) => {
											field.onChange({
												type: value as TTimeFilter,
												date: field.value?.date || new Date(),
											})
										}}
									>
										<SelectTrigger className="w-[120px]">
											<SelectValue placeholder="Select comparison" />
										</SelectTrigger>
										<SelectContent>
											{timeFilterOptions.map((op) => (
												<SelectItem value={op} key={op}>
													{op.toUpperCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														"pl-3 text-left font-normal m-0",
														!field.value?.date && "text-muted-foreground"
													)}
												>
													{field.value?.date ? (
														<span>{format(field.value.date, "yyyy/MM/dd")} </span>
													) : (
														"Start Time"
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent>
											<Calendar
												mode="single"
												selected={field?.value?.date}
												onSelect={(date) => {
													if (date) {
														field.onChange({
															type: field?.value?.type || "equals",
															date,
														})
													}
												}}
												className="rounded-md border"
											/>
										</PopoverContent>
									</Popover>
								</div>
							</FormItem>
						)}
					/>

					<div className="flex gap-2">
						<Button type="submit">Search</Button>
						<Button variant="outline" onClick={handleClearFilter} type="button">
							Clear
						</Button>
					</div>
				</div>
			</form>
		</Form>
	)
}
