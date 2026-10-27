"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Code2, GitBranch, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface NewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewReviewModal({ isOpen, onClose }: NewReviewModalProps) {
  const [tab, setTab] = useState<"repo" | "snippet">("repo");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [language, setLanguage] = useState("python");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = tab === "repo" 
        ? { repo_name: repoName.trim(), branch: branch.trim() || "main" }
        : { repo_name: `snippet-${language}`, code_snippet: codeSnippet, language };

      const res = await api.post("/reviews/run", payload);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      onClose();
      router.push(`/dashboard/reviews/${res.data.id}`);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || "Failed to generate AI review. Please check inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl glass-card p-6 shadow-2xl border border-border/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">New AI Code Review</h2>
                <p className="text-xs text-muted-foreground">
                  Run Gemini Staff Engineer analysis on your repository or snippet
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 my-4 bg-secondary/50 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setTab("repo")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "repo"
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              GitHub Repository
            </button>
            <button
              type="button"
              onClick={() => setTab("snippet")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "snippet"
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Direct Code Snippet
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "repo" ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Repository Name (owner/repo)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tiangolo/fastapi or your-org/repo"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Public repositories and connected private repositories are fully supported.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Code Snippet to Review
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste your function, API route, or SQL query here..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border/50 bg-secondary/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    Run AI Review
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
