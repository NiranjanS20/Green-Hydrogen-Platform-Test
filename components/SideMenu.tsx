import React from 'react'
import Link from 'next/link'

const SideMenu: React.FC = () => {
	const items = [
		{ href: '/dashboard', label: 'Overview' },
		{ href: '/production', label: 'Production' },
		{ href: '/storage', label: 'Storage' },
		{ href: '/transportation', label: 'Transportation' },
		{ href: '/research', label: 'Research' }
	]

	return (
		<aside className="w-56 bg-white border-r p-4">
			<nav className="space-y-2">
				{items.map(i => (
					<Link key={i.href} href={i.href} className="block text-sm text-gray-700 hover:bg-gray-50 rounded px-2 py-1">{i.label}</Link>
				))}
			</nav>
		</aside>
	)
}

export default SideMenu
//
