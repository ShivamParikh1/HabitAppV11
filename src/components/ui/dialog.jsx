import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <>
      {React.Children.map(children, child => {
        if (child.type === DialogTrigger) {
          return React.cloneElement(child, { onOpenChange })
        }
        if (child.type === DialogContent) {
          return open ? React.cloneElement(child, { onOpenChange }) : null
        }
        return child
      })}
    </>
  )
}

const DialogTrigger = ({ children, onOpenChange, asChild, ...props }) => {
  const handleClick = () => onOpenChange?.(true)
  
  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick })
  }
  
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

const DialogContent = ({ className, children, onOpenChange, ...props }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange?.(false)}
    />
    <div
      className={cn(
        "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
        className
      )}
      {...props}
    >
      {children}
      <button
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => onOpenChange?.(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  </div>
)

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }