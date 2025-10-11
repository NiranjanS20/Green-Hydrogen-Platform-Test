import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...rest }) => {
	return (
		<label className="block text-sm">
			{label && <span className="text-xs text-gray-600">{label}</span>}
			<input className={`mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 ${className}`} {...rest} />
		</label>
	)
}

export default Input
//
