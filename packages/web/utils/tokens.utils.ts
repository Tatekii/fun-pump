import { TokenSale } from "@fun-pump/smart-contract";


function applyTimeFilter(time: number, timeFilter?: { type: "before" | "after" | "equals"; date: Date} ): boolean {
	if (!timeFilter) return true
	const timestamp = new Date(time * 1000)

	if (timeFilter.type === "equals" && timestamp.getTime() !== timeFilter.date.getTime()) return false
	if (timeFilter.type === "before" && timestamp >= timeFilter.date) return false
	if (timeFilter.type === "after" && timestamp <= timeFilter.date) return false

	return true
}
export function filterToken(token: TokenSale, filter?: any): boolean {
	if (!filter) return true

	// Apply name filter
	if (filter.name && !token.name.toLowerCase().includes(filter.name.toLowerCase())) {
		return false
	}

	// Apply start time filter
	if (filter.startTime && !applyTimeFilter(Number(token.startTime), filter.startTime)) {
		return false
	}

	// Apply end time filter
	if (filter.endTime && !applyTimeFilter(Number(token.endTime), filter.endTime)) {
		return false
	}

	return true
}
