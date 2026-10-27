"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { FileCode2, GitBranch, ArrowRight, Activity, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface ReviewItem {
  id: string;
  repo_name: string;
  branch: string;
  created_at: string;
  critical_count: number;
  total_issues: number;
  score: number;
}

export default function ReviewsPage() {
  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["reviews", "history"],
    queryFn: async () => {
      const res = await api.get("/reviews/history");
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
          AI Code Reviews
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">
          History of all automated code reviews and their quality scores.
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/30">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">
              Connect a repository and click &quot;Run Review&quot; to get started.
            </p>
          </div>
        ) : (
          reviews.map((review: ReviewItem, i: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/reviews/${review.id}`}>
                <div className="glass-card-hover p-5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileCode2 className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.repo_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground border border-border/50 flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {review.branch}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <Zap className="h-3 w-3" />
                          {review.critical_count} critical
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {review.total_issues} total issues
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</div>
                      <div className={`text-2xl font-bold ${
                        review.score >= 80 ? 'text-emerald-400' :
                        review.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {review.score}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
