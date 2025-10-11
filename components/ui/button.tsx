import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
	const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none disabled:opacity-50'
	const variants: Record<string, string> = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700',
		secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
		ghost: 'bg-transparent text-gray-800 hover:bg-gray-50'
	}
	return (
		<button className={`${base} ${variants[variant]} ${className}`} {...rest}>
			{children}
		</button>
	)
}

export default Button
//
