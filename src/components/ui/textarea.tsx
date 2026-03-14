import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:bg-white/[0.05] focus-visible:shadow-[var(--glow-teal-focus)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-white/[0.02] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[var(--glow-conflict-sm)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
