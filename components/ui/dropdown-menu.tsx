import * as React from "react"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block">{children}</div>
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => {
  if (asChild) {
    return <>{children}</>
  }
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = ({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}) => {
  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align]

  return (
    <div
      className={`absolute top-full mt-2 ${alignClass} z-50 min-w-[160px] rounded-lg bg-white shadow-lg border border-gray-200 py-1 ${className}`}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) => {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
