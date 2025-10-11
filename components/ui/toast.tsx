import React from 'react'

type ToastProps = {
	message: React.ReactNode
	variant?: 'info' | 'success' | 'error'
}

export const Toast: React.FC<ToastProps> = ({ message, variant = 'info' }) => {
	const variants: Record<string, string> = {
		info: 'bg-blue-600',
		success: 'bg-green-600',
		error: 'bg-red-600'
	}
	return <div className={`text-white px-3 py-2 rounded ${variants[variant]}`}>{message}</div>
}

export default Toast
//
