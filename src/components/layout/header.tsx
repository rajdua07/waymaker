"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const currentPage = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const pageLabels: Record<string, string> = {
    dashboard: "Dashboard",
    decisions: "Decision Log",
    settings: "Settings",
    rooms: "Rooms",
  };

  return (
    <header className="h-14 border-b border-white/[0.04] bg-white/[0.02] backdrop-blur-md flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-gray/60">Waymaker</span>
        <span className="text-slate-gray/30">/</span>
        <span className="text-white font-medium">
          {pageLabels[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 outline-none group">
            <span className="text-sm text-slate-gray group-hover:text-white/80 transition-colors">
              {session?.user?.name || session?.user?.email}
            </span>
            <Avatar className="h-8 w-8 ring-2 ring-teal/20 group-hover:ring-teal/40 transition-all">
              <AvatarFallback className="bg-teal/15 text-teal text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-navy-light border-white/10">
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-gray hover:text-white cursor-pointer"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
