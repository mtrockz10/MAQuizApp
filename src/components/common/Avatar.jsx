import { cn } from "../../utils/cn"

export function Avatar({ user, size = "md", className, isOnline }) {
  const sizes = { sm: "h-6 w-6 text-xs", md: "h-8 w-8 text-sm", lg: "h-10 w-10 text-base" }
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.avatar || "?"

  return (
    <div className={cn("relative flex-shrink-0", sizes[size], className)}>
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold shadow-glow">
        {initials}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 flex h-3 w-3 rounded-full border-2 border-white bg-mint dark:border-gray-900" />
      )}
    </div>
  )
}
