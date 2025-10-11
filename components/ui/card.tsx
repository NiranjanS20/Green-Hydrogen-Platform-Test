import React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
	title?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', ...rest }) => {
	return (
		<div className={`bg-white shadow-sm rounded-lg p-4 ${className}`} {...rest}>
			{title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
			<div>{children}</div>
		</div>
	)
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => (
	<div className={`mb-4 ${className}`} {...rest}>{children}</div>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => (
	<div className={` ${className}`} {...rest}>{children}</div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...rest }) => (
	<h3 className={`text-lg font-semibold ${className}`} {...rest}>{children}</h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...rest }) => (
	<p className={`text-sm text-gray-600 ${className}`} {...rest}>{children}</p>
)

export default Card
//
