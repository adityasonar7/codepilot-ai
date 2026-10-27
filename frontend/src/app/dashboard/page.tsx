"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GitBranch,
  MessageSquareCode,
  Bug,
  Shield,
  Star,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Plus,
  PlayCircle,
  FileCode2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
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

interface SeverityItem {
  level: string;
  count: number;
  color: string;
  textColor: string;
}

interface DashboardStats {
  repositories_reviewed: number;
  reviews_generated: number;
  issues_found: number;
  security_warnings: number;
  average_score: number;
  review_time_saved_hours: number;
  weekly_data: { day: string; reviews: number; issues: number }[];
  recent_reviews: ReviewItem[];
  severity_distribution: SeverityItem[];
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["reviews", "stats"],
    queryFn: async () => {
      const res = await api.get("/reviews/stats");
      return res.data;
    },
    refetchInterval: 15000,
  });

  const reposReviewed = stats?.repositories_reviewed ?? 0;
  const reviewsCount = stats?.reviews_generated ?? 0;
  const issuesFound = stats?.issues_found ?? 0;
  const securityWarnings = stats?.security_warnings ?? 0;
  const avgScore = stats?.average_score ?? 100;
  const timeSaved = stats?.review_time_saved_hours ?? 0;

  const weeklyData = stats?.weekly_data ?? [
    { day: "Mon", reviews: 0, issues: 0 },
    { day: "Tue", reviews: 0, issues: 0 },
    { day: "Wed", reviews: 0, issues: 0 },
    { day: "Thu", reviews: 0, issues: 0 },
    { day: "Fri", reviews: 0, issues: 0 },
    { day: "Sat", reviews: 0, issues: 0 },
    { day: "Sun", reviews: 0, issues: 0 },
  ];
  const maxReviews = Math.max(1, ...weeklyData.map((d) => d.reviews));

  const recentReviews = stats?.recent_reviews ?? [];
  const severityData = stats?.severity_distribution ?? [
    { level: "Critical", count: 0, color: "bg-rose-500", textColor: "text-rose-400" },
    { level: "High", count: 0, color: "bg-amber-500", textColor: "text-amber-400" },
    { level: "Medium", count: 0, color: "bg-blue-500", textColor: "text-blue-400" },
    { level: "Low", count: 0, color: "bg-emerald-500", textColor: "text-emerald-400" },
  ];
  const totalSeverity = severityData.reduce((sum, d) => sum + d.count, 0);

  const metrics = [
    {
      title: "Repositories Reviewed",
      value: String(reposReviewed),
      change: reviewsCount === 0 ? "New Account" : `${reposReviewed} connected`,
      icon: GitBranch,
      color: "from-brand-500 to-indigo-500",
      glowColor: "rgba(99, 102, 241, 0.15)",
    },
    {
      title: "AI Reviews Generated",
      value: String(reviewsCount),
      change: reviewsCount === 0 ? "Ready for review" : `${reviewsCount} total`,
      icon: MessageSquareCode,
      color: "from-emerald-500 to-teal-500",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
      title: "Issues Found",
      value: String(issuesFound),
      change: reviewsCount === 0 ? "0 detected" : `${issuesFound} total issues`,
      icon: Bug,
      color: "from-amber-500 to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
    {
      title: "Security Warnings",
      value: String(securityWarnings),
      change: reviewsCount === 0 ? "Clean status" : `${securityWarnings} alerts`,
      icon: Shield,
      color: "from-rose-500 to-pink-500",
      glowColor: "rgba(244, 63, 94, 0.15)",
    },
    {
      title: "Average Score",
      value: reviewsCount === 0 ? "100" : `${avgScore}`,
      change: reviewsCount === 0 ? "Baseline" : "Code quality health",
      icon: Star,
      color: "from-violet-500 to-purple-500",
      glowColor: "rgba(139, 92, 246, 0.15)",
    },
    {
      title: "Review Time Saved",
      value: `${timeSaved}h`,
      change: reviewsCount === 0 ? "0h saved" : `${timeSaved}h automated`,
      icon: Clock,
      color: "from-cyan-500 to-blue-500",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold flex items-center gap-2"
          >
            Dashboard
            {reviewsCount === 0 && (
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Fresh Account
              </span>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Real-time code quality overview and automated vulnerability detection.
          </motion.p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Run New Review
          </Button>
        </div>
      </div>

      {/* Zero State Call To Action Banner for New Accounts */}
      {reviewsCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-transparent"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Get Started with Gemini Staff Engineer Reviews
              </div>
              <h2 className="text-lg font-bold">
                Run your first automated code review in seconds
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Paste any code snippet or enter a GitHub repository (e.g., tiangolo/fastapi or your own project). Our Gemini AI engine will scan for SQL injection, hardcoded secrets, performance traps, and architectural anti-patterns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Analyze Code Snippet
              </Button>
              <Link href="/dashboard/repositories">
                <Button variant="outline" size="sm" className="gap-2">
                  <GitBranch className="h-4 w-4" />
                  Connect Repo
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="glass-card-hover p-5 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} transition-transform group-hover:scale-110`}
                  style={{ boxShadow: `0 4px 15px ${metric.glowColor}` }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {isLoading ? "—" : metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metric.title}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts & Review Overview ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold">Review Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reviews and issues detected over the last 7 days
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />
                Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Issues
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48 pt-4 px-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Reviews bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.reviews / maxReviews) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.05 * i }}
                    className="w-full max-w-[18px] bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-sm transition-all group-hover:brightness-125 min-h-[4px]"
                    title={`${d.reviews} reviews on ${d.day}`}
                  />
                  {/* Issues bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.issues / Math.max(1, maxReviews)) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.05 * i + 0.1 }}
                    className="w-full max-w-[18px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm transition-all group-hover:brightness-125 min-h-[4px]"
                    title={`${d.issues} issues on ${d.day}`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Issue Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold mb-1">Severity Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {totalSeverity === 0 ? "No active issues detected" : `${totalSeverity} issues identified`}
          </p>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-secondary flex overflow-hidden mb-6">
            {totalSeverity === 0 ? (
              <div className="w-full h-full bg-emerald-500/40" />
            ) : (
              severityData.map((d, i) => (
                <div
                  key={i}
                  className={cn("h-full transition-all", d.color)}
                  style={{ width: `${(d.count / totalSeverity) * 100}%` }}
                />
              ))
            )}
          </div>

          {/* Legend items */}
          <div className="space-y-3">
            {severityData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", d.color)} />
                  <span className="text-muted-foreground">{d.level}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={cn("font-medium", d.textColor)}>
                    {d.count}
                  </span>
                  <span className="text-muted-foreground/50 w-8 text-right">
                    {totalSeverity > 0 ? `${Math.round((d.count / totalSeverity) * 100)}%` : "0%"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Reviews & Quick Actions ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Reviews</h3>
            <Link
              href="/dashboard/reviews"
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-border/50 bg-secondary/20">
              <FileCode2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <div className="text-sm font-medium">No reviews generated yet</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Click &quot;Run New Review&quot; above to inspect a repository or paste a snippet.
              </p>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Run First Review
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReviews.map((review, i) => (
                <Link key={review.id} href={`/dashboard/reviews/${review.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group mb-1.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-mono font-medium text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                        <FileCode2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold group-hover:text-brand-400 transition-colors">
                          {review.repo_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Branch: {review.branch} &bull; {review.total_issues} issues ({review.critical_count} critical)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">
                          {review.score}/100
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Review Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold mb-2">Automated Security Checks</h3>
            <p className="text-xs text-muted-foreground mb-4">
              CodePilot AI scans for over 50 enterprise vulnerability patterns:
            </p>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>SQL Injection & Parameterized Query enforcement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Hardcoded API tokens & password leaks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Dangerous eval/exec & deserialization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Async blocking calls & event loop health</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full gap-2 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              Try Code Review Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      <NewReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
