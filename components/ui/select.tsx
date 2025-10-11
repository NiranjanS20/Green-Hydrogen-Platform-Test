import React from 'react'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	label?: string
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...rest }) => {
	return (
		<label className="block text-sm">
			{label && <span className="text-xs text-gray-600">{label}</span>}
			<select className={`mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 ${className}`} {...rest}>
				{children}
			</select>
		</label>
	)
}

export default Select
//
