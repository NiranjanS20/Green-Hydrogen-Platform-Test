import React from 'react'

type TabsProps = {
	tabs: { id: string; label: React.ReactNode }[]
	activeId: string
	onChange: (id: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange }) => {
	return (
		<div className="flex space-x-2 border-b pb-2">
			{tabs.map((t) => (
				<button
					key={t.id}
					onClick={() => onChange(t.id)}
					className={`px-3 py-1 text-sm rounded-t-md ${activeId === t.id ? 'bg-white border border-b-0' : 'text-gray-600'}`}>
					{t.label}
				</button>
			))}
		</div>
	)
}

export default Tabs
//
