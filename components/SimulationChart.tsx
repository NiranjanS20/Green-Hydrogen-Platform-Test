import React from 'react'
import Card from './ui/card'

type Props = {
	title?: string
}

const SimulationChart: React.FC<Props> = ({ title = 'Simulation' }) => {
	return (
		<Card title={title}>
			<div className="h-48 flex items-center justify-center text-sm text-gray-500">Chart placeholder (replace with chart library)</div>
		</Card>
	)
}

export default SimulationChart
//
