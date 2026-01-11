"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, ImageIcon, FolderOpen, Wand2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Explore", icon: Sparkles },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/gallery", label: "Gallery", icon: FolderOpen },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 group-hover:shadow-[var(--accent)]/40 transition-shadow">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight hidden sm:block">
              <span className="gradient-text">DLM</span>
              <span className="text-[var(--muted)]"> Generator</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--card-bg)] text-white shadow-lg"
                      : "text-[var(--muted)] hover:text-white hover:bg-[var(--card-bg)]/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <Link
            href="/generate"
            className="btn-primary text-sm hidden md:flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Create
          </Link>
        </div>
      </nav>
    </header>
  );
}
