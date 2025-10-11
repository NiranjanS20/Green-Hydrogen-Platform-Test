import React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children, ...rest }) => {
	const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
	const variants: Record<string, string> = {
		default: 'bg-gray-100 text-gray-800',
		success: 'bg-green-100 text-green-800',
		warning: 'bg-amber-100 text-amber-800',
		error: 'bg-red-100 text-red-800',
		info: 'bg-blue-100 text-blue-800'
	}

	return (
		<span className={`${base} ${variants[variant]} ${className}`} {...rest}>
			{children}
		</span>
	)
}

export default Badge
//
