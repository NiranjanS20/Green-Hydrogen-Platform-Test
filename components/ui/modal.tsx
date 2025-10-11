import React from 'react'

type ModalProps = {
	open: boolean
	onClose: () => void
	title?: React.ReactNode
}

export const Modal: React.FC<ModalProps & React.HTMLAttributes<HTMLDivElement>> = ({ open, onClose, title, children, className = '' }) => {
	if (!open) return null
	return (
		<div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
			<div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
			<div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
				{title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
				<div>{children}</div>
			</div>
		</div>
	)
}

export default Modal
//
