import Link from 'next/link'
import React from 'react'

const Navigation: React.FC = () => {
	return (
		<nav className="w-full bg-white border-b">
			<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link href="/" className="text-lg font-bold">Green Hydrogen</Link>
				<div className="space-x-4">
					<Link href="/dashboard" className="text-sm text-gray-700">Dashboard</Link>
					<Link href="/production" className="text-sm text-gray-700">Production</Link>
					<Link href="/storage" className="text-sm text-gray-700">Storage</Link>
				</div>
			</div>
		</nav>
	)
}

export default Navigation
//
