"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bug, ShieldAlert, Zap, AlertCircle, FileCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const severityColors: Record<string, string> = {
  critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const categoryIcons: Record<string, React.ReactNode> = {
  security: <ShieldAlert className="h-4 w-4" />,
  bug: <Bug className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  style: <FileCode className="h-4 w-4" />,
  maintainability: <AlertCircle className="h-4 w-4" />,
};

interface ReviewIssue {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  file_path: string;
  line_number?: number;
  suggestion?: string;
  snippet?: string;
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const { data: review, isLoading } = useQuery({
    queryKey: ["reviews", reviewId],
    queryFn: async () => {
      const res = await api.get(`/reviews/${reviewId}`);
      return res.data;
    },
  });

  if (isLoading) return <div className="p-10 text-center">Loading review details...</div>;
  if (!review) return <div className="p-10 text-center text-rose-400">Review not found.</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Review for {review.repo_name}
            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {review.branch}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(review.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Quality Score</div>
          <div className={`text-5xl font-bold ${
            review.score >= 80 ? 'text-emerald-400' :
            review.score >= 60 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {review.score}
          </div>
        </div>
        <div className="glass-card p-6 md:col-span-3 flex flex-col justify-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-400" />
            AI Summary
          </h3>
          <p className="text-muted-foreground mt-2">{review.summary}</p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-rose-400">{review.critical_count}</span>
              <span className="text-xs text-muted-foreground uppercase">Critical</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-400">{review.high_count}</span>
              <span className="text-xs text-muted-foreground uppercase">High</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-amber-400">{review.medium_count}</span>
              <span className="text-xs text-muted-foreground uppercase">Medium</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-400">{review.low_count}</span>
              <span className="text-xs text-muted-foreground uppercase">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Issues Found ({review.total_issues})</h2>
        <div className="space-y-4">
          {review.issues.map((issue: ReviewIssue, index: number) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 border-l-4"
              style={{ borderLeftColor: issue.severity === 'critical' ? '#fb7185' : issue.severity === 'high' ? '#fb923c' : issue.severity === 'medium' ? '#fbbf24' : '#60a5fa' }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {categoryIcons[issue.category]}
                  {issue.title}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium border uppercase tracking-wider ${severityColors[issue.severity]}`}>
                  {issue.severity}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded inline-block mb-4">
                {issue.file_path}:{issue.line_number}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Issue</div>
                  <p className="text-muted-foreground text-sm">{issue.description}</p>
                </div>
                
                <div>
                  <div className="text-sm font-semibold mb-1">Suggested Fix</div>
                  <p className="text-muted-foreground text-sm">{issue.suggestion}</p>
                </div>

                {issue.snippet && (
                  <div className="mt-4 bg-[#0d1117] border border-border/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <pre>
                      <code>{issue.snippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
