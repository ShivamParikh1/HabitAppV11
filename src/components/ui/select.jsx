import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md">
          {React.Children.map(children, child => {
            if (child.type === SelectContent) {
              return React.cloneElement(child, { 
                value, 
                onValueChange: (newValue) => {
                  onValueChange?.(newValue)
                  setIsOpen(false)
                }
              })
            }
            return null
          })}
        </div>
      )}
    </div>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value }) => {
  return <span>{value || placeholder}</span>
}

const SelectContent = ({ className, children, value, onValueChange, ...props }) => (
  <div
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
)

const SelectItem = ({ className, children, value: itemValue, value: selectedValue, onValueChange, ...props }) => (
  <div
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => onValueChange?.(itemValue)}
    {...props}
  >
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }