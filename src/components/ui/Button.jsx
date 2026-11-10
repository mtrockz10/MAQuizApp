import { forwardRef } from "react"
import { cn } from "../../utils/cn"

const Button = forwardRef(({ className, variant = "primary", size = "md", disabled, asChild = false, ...props }, ref) => {
  const Comp = asChild ? (props) => <span {...props} /> : "button"

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  }

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  }

  return (
    <Comp
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    />
  )
})

Button.displayName = "Button"
export { Button }
export default Button
