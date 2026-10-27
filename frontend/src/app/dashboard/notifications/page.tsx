"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, MessageSquareCode, Clock, Trash2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { NewReviewModal } from "@/components/dashboard/new-review-modal";
import api from "@/lib/api";

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

export default function NotificationsPage() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [clearedBefore, setClearedBefore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("notifications_cleared_at") || "0", 10);
    }
    return 0;
  });

  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["reviews", "history"],
    queryFn: async () => {
      const res = await api.get("/reviews/history");
      return res.data;
    },
  });

  // Dynamically generate notifications from user's real reviews
  const allNotifications = reviews.flatMap((r): NotificationItem[] => {
    const items: NotificationItem[] = [
      {
        id: `review-${r.id}`,
        reviewId: r.id,
        type: "review",
        title: `AI Review completed for ${r.repo_name}`,
        description: `Quality Score: ${r.score}/100 — ${r.total_issues} issues identified (${r.branch} branch)`,
        timestamp: new Date(r.created_at).getTime(),
        date: r.created_at,
      },
    ];

    if (r.critical_count > 0) {
      items.push({
        id: `sec-${r.id}`,
        reviewId: r.id,
        type: "security",
        title: `Security alert in ${r.repo_name}`,
        description: `${r.critical_count} critical severity vulnerability flags require immediate remediation.`,
        timestamp: new Date(r.created_at).getTime() + 1000,
        date: r.created_at,
      });
    }

    return items;
  });

  // Filter out cleared notifications
  const activeNotifications = allNotifications
    .filter((n) => n.timestamp > clearedBefore)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleClearAll = () => {
    const now = Date.now();
    setClearedBefore(now);
    localStorage.setItem("notifications_cleared_at", String(now));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold flex items-center gap-2">
            Notifications
            {activeNotifications.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-normal">
                {activeNotifications.length} new
              </span>
            )}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time alerts for code reviews, security findings, and repository scans.
          </p>
        </div>

        {activeNotifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading notifications...
        </div>
      ) : activeNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No notifications</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-6">
            All caught up! Notifications will appear automatically whenever an AI code review completes or security issues are detected.
          </p>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsReviewModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Run a Review
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {activeNotifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <Link href={`/dashboard/reviews/${notif.reviewId}`}>
                <div
                  className={`glass-card p-4 flex items-start gap-3.5 cursor-pointer hover:bg-accent/40 transition-colors border-l-4 ${
                    notif.type === "security"
                      ? "border-l-rose-500 bg-rose-500/[0.02]"
                      : "border-l-brand-500"
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-secondary/80 flex-shrink-0">
                    {notif.type === "security" ? (
                      <Shield className="h-4 w-4 text-rose-400" />
                    ) : (
                      <MessageSquareCode className="h-4 w-4 text-brand-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {notif.title}
                      {notif.type === "security" && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                          Security
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notif.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <NewReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
