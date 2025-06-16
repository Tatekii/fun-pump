
// Helper function to calculate time progress
export const calculateTimeProgress = (startTime: bigint, endTime: bigint): number => {
	const now = Date.now() / 1000 // Current time in seconds
	const start = Number(startTime)
	const end = Number(endTime)

	if (now < start) return 0 // Not started yet
	if (now > end) return 100 // Already ended

	const elapsed = now - start
	const total = end - start
	return Math.min(100, Math.max(0, (elapsed / total) * 100))
}
// Helper function to calculate funding progress
export const calculateFundingProgress = (raised: bigint, target: bigint): number => {
	if (target === BigInt(0)) return 0
	const progress = (Number(raised) / Number(target)) * 100
	return Math.min(100, Math.max(0, progress))
}
// Helper function to format time remaining
export const formatTimeRemaining = (endTime: bigint): string => {
	const now = Date.now() / 1000
	const end = Number(endTime)
	const remaining = end - now

	if (remaining <= 0) return "Ended"

	const days = Math.floor(remaining / 86400)
	const hours = Math.floor((remaining % 86400) / 3600)
	const minutes = Math.floor((remaining % 3600) / 60)

	if (days > 0) return `${days}d ${hours}h remaining`
	if (hours > 0) return `${hours}h ${minutes}m remaining`
	return `${minutes}m remaining`
}// 助手函数：格式化斜率显示
export const formatSlope = (slope: bigint): string => {
	// 将BigInt转换为可读格式，考虑到1e18的缩放
	const slopeNumber = Number(slope) / 1e18;
	return slopeNumber.toFixed(6);
};

