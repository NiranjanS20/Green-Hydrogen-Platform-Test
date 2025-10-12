import * as React from "react"

type MenuContextType = {
  open: boolean
  setOpen: (v: boolean) => void
  rootRef: React.RefObject<HTMLDivElement | null>
}

const MenuContext = React.createContext<MenuContextType | null>(null)

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return
      const root = rootRef.current
      if (root && !root.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const value = React.useMemo(() => ({ open, setOpen, rootRef }), [open])

  return (
    <MenuContext.Provider value={value}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </MenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const ctx = React.useContext(MenuContext)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    ctx?.setOpen(!ctx.open)
    onClick?.(e)
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent: React.FC<{
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}> = ({ children, align = 'center', className = '' }) => {
  const ctx = React.useContext(MenuContext)
  if (!ctx) return null
  if (!ctx.open) return null

  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align]

  return (
    <div
      className={`absolute top-full mt-2 ${alignClass} z-50 min-w-[160px] rounded-lg bg-white shadow-lg border border-gray-200 py-1 ${className}`}
      role="menu"
    >
      {children}
    </div>
  )
}

const DropdownMenuItem: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
}> = ({ children, onClick, className = '' }) => {
  const ctx = React.useContext(MenuContext)
  const handle = () => {
    onClick?.()
    ctx?.setOpen(false)
  }
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${className}`}
      onClick={handle}
      role="menuitem"
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
