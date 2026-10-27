"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  User as UserIcon,
  RotateCcw,
  Shield,
  MessageSquareCode,
  Clock,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NewReviewModal } from "@/components/dashboard/new-review-modal";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role: string;
  plan: string;
  review_count: number;
}

interface ReviewItem {
  id: string;
  repo_name: string;
  branch: string;
  score: number;
  total_issues: number;
  critical_count: number;
  created_at: string;
}

interface NotificationItem {
  id: string;
  reviewId: string;
  type: "review" | "security";
  title: string;
  description: string;
  timestamp: number;
  date: string;
}

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [clearedBefore, setClearedBefore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("notifications_cleared_at") || "0", 10);
    }
    return 0;
  });

  // Fetch real current user
  const { data: user } = useQuery<UserProfile>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
    staleTime: 60000,
  });

  // Fetch reviews for dynamic notifications
  const { data: reviews = [] } = useQuery<ReviewItem[]>({
    queryKey: ["reviews", "history"],
    queryFn: async () => {
      const res = await api.get("/reviews/history");
      return res.data;
    },
  });

  // Dynamically derive active notifications
  const allNotifications = reviews.flatMap((r): NotificationItem[] => {
    const items: NotificationItem[] = [
      {
        id: `review-${r.id}`,
        reviewId: r.id,
        type: "review",
        title: `AI Review: ${r.repo_name}`,
        description: `Score ${r.score}/100 with ${r.total_issues} issues`,
        timestamp: new Date(r.created_at).getTime(),
        date: r.created_at,
      },
    ];

    if (r.critical_count > 0) {
      items.push({
        id: `sec-${r.id}`,
        reviewId: r.id,
        type: "security",
        title: `Security Alert: ${r.repo_name}`,
        description: `${r.critical_count} critical issues detected`,
        timestamp: new Date(r.created_at).getTime() + 1000,
        date: r.created_at,
      });
    }

    return items;
  });

  const activeNotifications = allNotifications
    .filter((n) => n.timestamp > clearedBefore)
    .sort((a, b) => b.timestamp - a.timestamp);

  const hasUnread = activeNotifications.length > 0;

  const handleClearNotifications = () => {
    const now = Date.now();
    setClearedBefore(now);
    localStorage.setItem("notifications_cleared_at", String(now));
  };

  // Reset account data mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/reset");
      return res.data;
    },
    onSuccess: () => {
      setClearedBefore(Date.now());
      localStorage.setItem("notifications_cleared_at", String(Date.now()));
      queryClient.invalidateQueries();
      setIsProfileOpen(false);
    },
  });

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const displayName = user?.name || user?.username || "Developer";
  const displayEmail = user?.email || `${user?.username || "user"}@codepilot.ai`;
  const initial = (displayName[0] || "U").toUpperCase();

  return (
    <>
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              placeholder="Search repositories, PRs, reviews..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border/50 bg-secondary/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 bg-background/80 px-1.5 py-0.5 rounded border border-border/50">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* New Review button */}
          <Button
            variant="gradient"
            size="sm"
            className="gap-1.5 hidden sm:flex"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Review
          </Button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-8 h-8 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {mounted && (
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-80 glass-card p-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-brand-400" />
                        Notifications
                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-500/20 text-brand-400">
                            {activeNotifications.length}
                          </span>
                        )}
                      </div>
                      {hasUnread && (
                        <button
                          onClick={handleClearNotifications}
                          className="text-[11px] text-muted-foreground hover:text-rose-400 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Clear
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {activeNotifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No new notifications. All caught up!
                        </div>
                      ) : (
                        activeNotifications.slice(0, 5).map((n) => (
                          <Link
                            key={n.id}
                            href={`/dashboard/reviews/${n.reviewId}`}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="block p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              {n.type === "security" ? (
                                <Shield className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                              ) : (
                                <MessageSquareCode className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
                              )}
                              <span className="text-xs font-medium text-foreground truncate">
                                {n.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {n.description}
                            </p>
                            <div className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDistanceToNow(new Date(n.date), { addSuffix: true })}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-border/50 text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center justify-center gap-1 py-1"
                      >
                        View all notifications
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-brand-500/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                  {initial}
                </div>
              )}
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform hidden sm:block",
                  isProfileOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 1, y: 5, scale: 0.95 }}
                    animate={{ opacity: 2, y: 0, scale: 1 }}
                    exit={{ opacity: 1, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-60 glass-card p-1.5 shadow-xl"
                  >
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <div className="text-sm font-semibold truncate">{displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">{displayEmail}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-500/20 text-brand-400">
                          {user?.plan?.toUpperCase() || "FREE"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {user?.review_count ?? 0} reviews
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      onClick={() => resetMutation.mutate()}
                      disabled={resetMutation.isPending}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {resetMutation.isPending ? "Resetting..." : "Reset Account Data"}
                    </button>

                    <div className="border-t border-border/50 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Review Modal */}
      <NewReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </>
  );
}
