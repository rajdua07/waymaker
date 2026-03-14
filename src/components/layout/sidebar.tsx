"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/decisions", label: "Decision Log", icon: "book" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-surface-1/80 backdrop-blur-md border-r border-white/[0.06] flex flex-col">
      <div className="p-6 mb-2">
        <Link href="/dashboard" className="flex items-center gap-1.5 group">
          <div className="relative">
            <div className="absolute -inset-3 bg-teal/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative text-teal font-extrabold text-lg tracking-[2px]">WAY</span>
          </div>
          <span className="text-white font-extrabold text-lg tracking-[2px]">MAKER</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="px-3 mb-3 text-[10px] font-bold text-slate-gray/50 uppercase tracking-[2px]">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-0.5",
                isActive
                  ? "bg-white/[0.06] text-white"
                  : "text-slate-gray hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal rounded-r-full shadow-[var(--glow-teal-sm)]" />
              )}
              {icons[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.04]">
        <Link
          href="/rooms/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-b from-teal to-teal/90 text-white text-sm font-semibold rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[var(--glow-teal-sm)] hover:from-teal-light hover:to-teal transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          New Room
        </Link>
      </div>
    </aside>
  );
}
