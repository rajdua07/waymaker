"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="h-14 border-b border-white/[0.06] bg-navy flex items-center justify-between px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none">
            <span className="text-sm text-slate-gray">
              {session?.user?.name || session?.user?.email}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-teal/20 text-teal text-xs font-semibold">
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
