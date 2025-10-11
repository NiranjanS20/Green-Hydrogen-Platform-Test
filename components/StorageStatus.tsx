import React from 'react'
import Card from './ui/card'
import Progress from './ui/progress'
import { calculateStorageUtilization } from '../lib/calculations'

type StorageStatusProps = {
	name?: string
	currentLevelKg?: number
	capacityKg?: number
	pressureBar?: number
}

const StorageStatus: React.FC<StorageStatusProps> = ({ name = 'Storage', currentLevelKg = 0, capacityKg = 1000, pressureBar }) => {
	const utilization = calculateStorageUtilization(currentLevelKg, capacityKg)

	return (
		<Card title={name}>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">Level</div>
					<div className="text-sm font-medium">{currentLevelKg} kg / {capacityKg} kg</div>
				</div>

				<Progress value={utilization} max={100} />

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<div className="text-xs text-gray-500">Utilization</div>
						<div className="font-medium">{utilization.toFixed(1)}%</div>
					</div>
					<div>
						<div className="text-xs text-gray-500">Pressure</div>
						<div className="font-medium">{pressureBar ? `${pressureBar} bar` : 'N/A'}</div>
					</div>
				</div>
			</div>
		</Card>
	)
}

export default StorageStatus
//
