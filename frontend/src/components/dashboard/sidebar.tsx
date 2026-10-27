"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  MessageSquareCode,
  Settings,
  Bell,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Search,
  BookOpen,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Repositories", href: "/dashboard/repositories", icon: GitBranch },
      { label: "Pull Requests", href: "/dashboard/pull-requests", icon: GitPullRequest },
    ],
  },
  {
    section: "AI Tools",
    items: [
      { label: "Reviews", href: "/dashboard/reviews", icon: MessageSquareCode },
      { label: "Security", href: "/dashboard/security", icon: Shield },
      { label: "Performance", href: "/dashboard/performance", icon: Zap },
      { label: "Documentation", href: "/dashboard/docs", icon: BookOpen },
    ],
  },
  {
    section: "Workspace",
    items: [
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-full border-r border-border/50 bg-card/50 backdrop-blur-xl relative z-30"
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 shadow-glow flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm whitespace-nowrap overflow-hidden"
                >
                  CodePilot AI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Quick search */}
        {!isCollapsed && (
          <div className="px-3 pt-4 pb-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-xs text-muted-foreground hover:bg-accent transition-colors">
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <kbd className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
          {navItems.map((group) => (
            <div key={group.section}>
              {!isCollapsed && (
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-3 mb-2">
                  {group.section}
                </h3>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                          isActive
                            ? "bg-brand-500/10 text-brand-400 font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-full"
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive
                              ? "text-brand-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="whitespace-nowrap overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              A
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium truncate">adiso</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Free Plan
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!isCollapsed && (
              <LogOut className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0" />
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
