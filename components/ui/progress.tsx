import React from 'react'

type ProgressProps = {
	value: number
	max?: number
}

export const Progress: React.FC<ProgressProps & React.HTMLAttributes<HTMLDivElement>> = ({ value, max = 100, className = '' }) => {
	const pct = Math.min(100, Math.max(0, (value / max) * 100))
	return (
		<div className={`w-full bg-gray-100 rounded-full h-3 overflow-hidden ${className}`}>
			<div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
		</div>
	)
}

export default Progress
//
