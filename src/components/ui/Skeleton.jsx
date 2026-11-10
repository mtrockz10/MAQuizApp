import { cn } from "../../utils/cn"

export function Skeleton({ className, width = "100%", height = 16 }) {
  return (
    <div className={cn("skeleton", `w-[${width}]`, `h-[${height}]`, className)} />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} height={14} />
      ))}
    </div>
  )
}
