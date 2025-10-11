import React from 'react'
import Card from './ui/card'
import { calculateHydrogenProduction, calculateCarbonOffset } from '../lib/calculations'

type Props = {
	energyInputKwh?: number
	electrolyzerEfficiency?: number
}

const ProductionMetrics: React.FC<Props> = ({ energyInputKwh = 1000, electrolyzerEfficiency = 70 }) => {
	const producedKg = calculateHydrogenProduction(energyInputKwh, electrolyzerEfficiency)
	const carbonOffset = calculateCarbonOffset(producedKg)

	return (
		<Card title="Production Metrics">
			<div className="grid grid-cols-3 gap-4">
				<div>
					<div className="text-xs text-gray-500">Energy Input</div>
					<div className="font-medium">{energyInputKwh} kWh</div>
				</div>
				<div>
					<div className="text-xs text-gray-500">H₂ Produced</div>
					<div className="font-medium">{producedKg.toFixed(2)} kg</div>
				</div>
				<div>
					<div className="text-xs text-gray-500">Carbon Offset</div>
					<div className="font-medium">{carbonOffset.toFixed(1)} kg CO₂</div>
				</div>
			</div>
		</Card>
	)
}

export default ProductionMetrics
//
