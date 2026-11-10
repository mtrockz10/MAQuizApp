import { cn } from "../../utils/cn"

export function Input({ className, leftIcon, rightIcon, ...props }) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0">
          {leftIcon}
        </div>
      )}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0">
          {rightIcon}
        </div>
      )}
      <input
        className={cn(
          "input",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
    </div>
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn("input min-h-[100px] resize-y", className)}
      {...props}
    />
  )
}
