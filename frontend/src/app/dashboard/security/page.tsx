"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck, Plus, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewReviewModal } from "@/components/dashboard/new-review-modal";
import api from "@/lib/api";

interface ReviewIssue {
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
  issues: ReviewIssue[];
  created_at: string;
}

export default function SecurityPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["reviews", "history"],
    queryFn: async () => {
      const res = await api.get("/reviews/history");
      return res.data;
    },
  });

  // Extract all security-related issues across user reviews
  const securityFindings = reviews.flatMap((r) =>
    (r.issues || [])
      .filter((issue) => issue.category === "security" || issue.severity === "critical" || issue.severity === "high")
      .map((issue) => ({
        ...issue,
        reviewId: r.id,
        repoName: r.repo_name,
        branch: r.branch,
      }))
  );

  const criticalCount = securityFindings.filter((f) => f.severity === "critical").length;
  const highCount = securityFindings.filter((f) => f.severity === "high").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold flex items-center gap-2">
            Security Scanner
            {criticalCount === 0 && highCount === 0 && (
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Clean Status
              </span>
            )}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated vulnerability detection, secret scanner, and dependency security alerts.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-medium">Critical Vulnerabilities</span>
          </div>
          <div className="text-3xl font-bold text-rose-400">
            {isLoading ? "—" : criticalCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Immediate exploit hazard (e.g. SQL injection, leaked secrets)
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">High Severity Issues</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {isLoading ? "—" : highCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Elevated security risks and dangerous code execution
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium">Security Health</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {isLoading ? "—" : criticalCount === 0 && highCount === 0 ? "100%" : `${Math.max(0, 100 - criticalCount * 20 - highCount * 10)}%`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on active review audits in your workspace
          </p>
        </div>
      </div>

      {/* Findings List or Clean Zero State */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Scanning security database...
        </div>
      ) : securityFindings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No security vulnerabilities found</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-6">
            All code in your workspace is currently clean. Run a new code review to scan repositories or snippets for 50+ enterprise security patterns.
          </p>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Scan New Code
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {securityFindings.map((finding, i) => (
            <motion.div
              key={finding.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="glass-card-hover p-5 border-l-4 border-l-rose-500 cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0 mt-0.5">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {finding.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        finding.severity === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {finding.severity}
                      </span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {finding.repoName} ({finding.branch})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {finding.description}
                    </p>
                    <div className="text-xs text-brand-400 font-medium">
                      💡 Suggested Fix: <span className="text-muted-foreground">{finding.suggestion}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 font-mono mt-2 inline-block">
                      {finding.file_path}:{finding.line_number}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/reviews/${finding.reviewId}`}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 flex-shrink-0"
                >
                  View review
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {finding.snippet && (
                <div className="mt-3 bg-[#0d1117] border border-border/50 rounded-lg p-3 font-mono text-xs text-rose-300/90 overflow-x-auto">
                  <code>{finding.snippet}</code>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <NewReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
