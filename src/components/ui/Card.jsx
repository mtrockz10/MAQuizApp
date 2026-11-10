import { cn } from "../../utils/cn"

export function Card({ className, children, hover = true, padding = "p-6" }) {
  return (
    <div className={cn("card", padding, hover && "card-interactive", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("text-xl font-semibold text-gray-900 dark:text-gray-100 heading", className)}>{children}</h3>
}

export function CardBody({ className, children }) {
  return <div className={cn(className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return <div className={cn("mt-6 flex items-center justify-between gap-3", className)}>{children}</div>
}
