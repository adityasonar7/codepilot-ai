"use client";

import { motion } from "framer-motion";
import {
  Shield,
  GitPullRequest,
  CheckCircle2,
  Bug,
  TrendingUp,
  Clock,
} from "lucide-react";

/* Mock dashboard data for the preview */
const metrics = [
  {
    label: "Repositories",
    value: "24",
    change: "+3",
    icon: GitPullRequest,
    color: "text-brand-400",
  },
  {
    label: "AI Reviews",
    value: "1,847",
    change: "+126",
    icon: CheckCircle2,
    color: "text-emerald-400",
  },
  {
    label: "Issues Found",
    value: "342",
    change: "-18",
    icon: Bug,
    color: "text-amber-400",
  },
  {
    label: "Security Alerts",
    value: "12",
    change: "-5",
    icon: Shield,
    color: "text-rose-400",
  },
];

const recentReviews = [
  {
    repo: "api-gateway",
    pr: "#847",
    score: 94,
    issues: 2,
    time: "2m ago",
    status: "passed",
  },
  {
    repo: "auth-service",
    pr: "#302",
    score: 71,
    issues: 8,
    time: "15m ago",
    status: "warnings",
  },
  {
    repo: "web-dashboard",
    pr: "#1,203",
    score: 88,
    issues: 4,
    time: "1h ago",
    status: "passed",
  },
  {
    repo: "ml-pipeline",
    pr: "#156",
    score: 45,
    issues: 14,
    time: "3h ago",
    status: "critical",
  },
];

export function DashboardPreview() {
  return (
    <section id="preview" className="relative py-24 overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
            Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Your command center for{" "}
            <span className="gradient-text">code quality</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A beautiful, real-time dashboard that gives you complete visibility
            into your codebase health.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glow behind dashboard */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-purple-500/10 to-brand-500/20 blur-3xl rounded-full" />

          <div className="relative glass-card p-1 sm:p-2 rounded-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-secondary/50 text-xs text-muted-foreground font-mono">
                  app.codepilot.ai/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-6 bg-background/50">
              {/* Metrics row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {metrics.map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="glass-card p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-xs text-emerald-400 font-medium">
                          {metric.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metric.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts and Recent Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Chart area */}
                <div className="lg:col-span-3 glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Weekly Reviews</h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      +23%
                    </div>
                  </div>
                  {/* Animated bar chart */}
                  <div className="flex items-end justify-between gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i, duration: 0.6 }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 opacity-80 hover:opacity-100 transition-opacity"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <span key={day}>{day}</span>
                      )
                    )}
                  </div>
                </div>

                {/* Recent reviews */}
                <div className="lg:col-span-2 glass-card p-4">
                  <h3 className="text-sm font-semibold mb-4">
                    Recent Reviews
                  </h3>
                  <div className="space-y-3">
                    {recentReviews.map((review, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              review.status === "passed"
                                ? "bg-emerald-400"
                                : review.status === "warnings"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          <div>
                            <div className="text-xs font-medium">
                              {review.repo}{" "}
                              <span className="text-muted-foreground">
                                {review.pr}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              {review.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-bold ${
                              review.score >= 80
                                ? "text-emerald-400"
                                : review.score >= 60
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {review.score}/100
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {review.issues} issues
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
