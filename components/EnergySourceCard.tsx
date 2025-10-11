import React from 'react'
import Card from './ui/card'
import Badge from './ui/badge'

type Props = {
	name?: string
	type?: 'solar' | 'wind' | 'hydro' | string
	capacityMw?: number
}

const EnergySourceCard: React.FC<Props> = ({ name = 'Source', type = 'solar', capacityMw = 1 }) => {
	const colorMap: Record<string, string> = {
		solar: 'bg-amber-500',
		wind: 'bg-indigo-500',
		hydro: 'bg-blue-500'
	}

	return (
		<Card title={name}>
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm text-gray-600">Type</div>
					<div className="mt-1 flex items-center gap-2">
						<span className={`w-3 h-3 rounded-full ${colorMap[type] || 'bg-gray-400'}`} />
						<div className="font-medium text-sm capitalize">{type}</div>
					</div>
				</div>

				<div className="text-right">
					<div className="text-sm text-gray-600">Capacity</div>
					<div className="font-medium">{capacityMw} MW</div>
				</div>
			</div>

			<div className="mt-3">
				<Badge variant="info">Renewable</Badge>
			</div>
		</Card>
	)
}

export default EnergySourceCard
//
