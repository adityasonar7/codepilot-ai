"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Code2,
  ShieldAlert,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { NewReviewModal } from "@/components/dashboard/new-review-modal";
import api from "@/lib/api";

interface Issue {
  id: string;
  file_path: string;
  line_number: number;
  severity: string;
  category: string;
  title: string;
  description: string;
  suggestion: string;
  snippet?: string;
}

interface ReviewItem {
  id: string;
  repo_name: string;
  branch: string;
  score: number;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  summary: string;
  issues: Issue[];
  created_at: string;
}

export default function PullRequestsPage() {
  const [filter, setFilter] = useState<"all" | "passed" | "needs_attention">("all");
  const [selectedPR, setSelectedPR] = useState<ReviewItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["reviews", "history"],
    queryFn: async () => {
      const res = await api.get("/reviews/history");
      return res.data;
    },
  });

  const filteredPRs = reviews.filter((pr) => {
    if (filter === "passed") return pr.score >= 80;
    if (filter === "needs_attention") return pr.score < 80;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Pull Request Reviews
            {reviews.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-normal">
                {reviews.length} reviewed
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated Gemini code reviews, diff inspections, and merge safety audits.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Review Pull Request
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "all" ? "bg-brand-500/10 text-brand-400 font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setFilter("passed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "passed" ? "bg-emerald-500/10 text-emerald-400 font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Passed Quality Gate ({reviews.filter((r) => r.score >= 80).length})
        </button>
        <button
          onClick={() => setFilter("needs_attention")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "needs_attention" ? "bg-rose-500/10 text-rose-400 font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Needs Attention ({reviews.filter((r) => r.score < 80).length})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PR List Column */}
        <div className={selectedPR ? "lg:col-span-6 space-y-3" : "lg:col-span-12 space-y-3"}>
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading pull request reviews...
            </div>
          ) : filteredPRs.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border/50 bg-card/30">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                <GitPullRequest className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No pull requests reviewed yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                Trigger an automated PR code review to analyze branch diffs for security vulnerabilities, bugs, and performance.
              </p>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Analyze a Pull Request
              </Button>
            </div>
          ) : (
            filteredPRs.map((pr) => {
              const isSelected = selectedPR?.id === pr.id;
              const hasCritical = pr.critical_count > 0;
              const isPassed = pr.score >= 80;

              return (
                <motion.div
                  key={pr.id}
                  layout
                  onClick={() => setSelectedPR(isSelected ? null : pr)}
                  className={`glass-card-hover p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected ? "border-brand-500 bg-brand-500/5 shadow-lg" : "border-border/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        <GitPullRequest className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm hover:underline">
                            {pr.repo_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                            {pr.branch}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {pr.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                          </span>
                          <span>&bull;</span>
                          <span>{pr.total_issues} issues found</span>
                          {hasCritical && (
                            <>
                              <span>&bull;</span>
                              <span className="text-rose-400 font-semibold">{pr.critical_count} critical</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className={`text-base font-bold ${isPassed ? "text-emerald-400" : "text-amber-400"}`}>
                          {pr.score}/100
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {isPassed ? "Approved" : "Needs Review"}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90 text-brand-400" : ""}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Selected PR Inspection Drawer */}
        <AnimatePresence>
          {selectedPR && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-6 glass-card p-6 rounded-2xl border border-border/80 sticky top-24 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-border/50 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{selectedPR.repo_name}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{selectedPR.branch}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{selectedPR.summary}</p>
                </div>
                <button
                  onClick={() => setSelectedPR(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Score bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-brand-400" />
                  <div>
                    <div className="text-xs font-semibold">Gemini Staff Engineer Score</div>
                    <div className="text-xs text-muted-foreground">{selectedPR.total_issues} issues identified</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400">{selectedPR.score}/100</div>
              </div>

              {/* Issues list */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Findings & Fixes</h3>
                {(selectedPR.issues || []).length === 0 ? (
                  <div className="text-xs text-muted-foreground py-4 text-center">
                    No issues identified in this pull request!
                  </div>
                ) : (
                  selectedPR.issues.map((issue, idx) => (
                    <div key={issue.id || idx} className="p-3 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          {issue.category === "security" ? <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> : <Code2 className="h-3.5 w-3.5 text-brand-400" />}
                          {issue.title}
                        </span>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                      <div className="text-xs text-brand-400 font-medium">
                        💡 Fix: <span className="text-muted-foreground">{issue.suggestion}</span>
                      </div>
                      {issue.snippet && (
                        <div className="p-2 rounded bg-[#0d1117] font-mono text-[11px] text-gray-300 overflow-x-auto">
                          <code>{issue.snippet}</code>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-border/50 flex justify-end">
                <Link
                  href={`/dashboard/reviews/${selectedPR.id}`}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  Open Full Review Report
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <NewReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
