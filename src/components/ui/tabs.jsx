import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)
  
  const handleValueChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { 
          value: value || activeTab, 
          onValueChange: handleValueChange 
        })
      )}
    </div>
  )
}

const TabsList = ({ className, children, value, onValueChange, ...props }) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
)

const TabsTrigger = ({ className, children, value: triggerValue, value: activeValue, onValueChange, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeValue === triggerValue && "bg-background text-foreground shadow-sm",
      className
    )}
    onClick={() => onValueChange?.(triggerValue)}
    {...props}
  >
    {children}
  </button>
)

const TabsContent = ({ className, children, value: contentValue, value: activeValue, ...props }) => {
  if (contentValue !== activeValue) return null
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }