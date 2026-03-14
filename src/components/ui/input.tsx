import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-foreground transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:bg-white/[0.05] focus-visible:shadow-[var(--glow-teal-focus)] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-white/[0.02] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[var(--glow-conflict-sm)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
