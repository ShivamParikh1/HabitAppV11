import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }) => {
  return <div className="relative inline-block">{children}</div>
}

const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const triggerProps = {
    onClick: () => setIsOpen(!isOpen),
    ...props
  }
  
  return (
    <div>
      {asChild ? React.cloneElement(children, triggerProps) : (
        <button {...triggerProps}>{children}</button>
      )}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1">
          {React.Children.map(children, child => {
            if (child.type === DropdownMenuContent) {
              return React.cloneElement(child, { onClose: () => setIsOpen(false) })
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

const DropdownMenuContent = ({ className, children, align = "end", onClose, ...props }) => (
  <div
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child =>
      React.cloneElement(child, { onClose })
    )}
  </div>
)

const DropdownMenuItem = ({ className, children, onClick, onClose, ...props }) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={(e) => {
      onClick?.(e)
      onClose?.()
    }}
    {...props}
  >
    {children}
  </div>
)

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }