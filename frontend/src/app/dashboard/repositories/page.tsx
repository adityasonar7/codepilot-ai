"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Plus, Search, Star, Lock, Globe, Loader2, MessageSquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ConnectRepoModal, GitHubRepo } from "@/components/dashboard/connect-repo-modal";

const langColors: Record<string, string> = {
  Python: "bg-emerald-400",
  TypeScript: "bg-blue-400",
  Go: "bg-cyan-400",
  Swift: "bg-orange-400",
  JavaScript: "bg-amber-400",
  Rust: "bg-rose-400",
};

interface ConnectedRepo {
  id: string;
  github_repo_id: number;
  name: string;
  full_name: string;
  is_private: boolean;
  language: string;
  last_scanned_at: string | null;
  is_connected: boolean;
  // Mock properties that would be aggregated later
  stars?: number;
  score?: number;
}

export default function RepositoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch connected repos from DB
  const { data: connectedRepos = [], isLoading: isLoadingConnected } = useQuery<ConnectedRepo[]>({
    queryKey: ["repos", "connected"],
    queryFn: async () => {
      const res = await api.get("/github/repos/connected");
      return res.data;
    },
  });

  // Fetch available repos from GitHub
  const { data: availableRepos = [], isLoading: isLoadingAvailable } = useQuery<GitHubRepo[]>({
    queryKey: ["repos", "available"],
    queryFn: async () => {
      const res = await api.get("/github/repos");
      return res.data;
    },
    enabled: isModalOpen, // Only fetch when modal is open
  });

  // Connect repo mutation
  const connectRepoMutation = useMutation({
    mutationFn: async (repoId: number) => {
      const res = await api.post(`/github/repos/${repoId}/connect`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos", "connected"] });
      queryClient.invalidateQueries({ queryKey: ["repos", "available"] });
      setIsModalOpen(false);
    },
  });

  const runReviewMutation = useMutation({
    mutationFn: async (repoName: string) => {
      const res = await api.post(`/reviews/run`, { repo_name: repoName });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/dashboard/reviews/${data.id}`);
    },
  });

  // Filter connected repos
  const filteredRepos = connectedRepos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
            Repositories
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and review your connected repositories.
          </p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Connect Repo
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/50 bg-secondary/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50"
        />
      </div>

      {/* Repo list */}
      {isLoadingConnected ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      ) : filteredRepos.length > 0 ? (
        <div className="grid gap-3">
          {filteredRepos.map((repo, i) => {
            const score = repo.score || 85; // Mock score if missing
            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="glass-card-hover p-5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{repo.full_name}</span>
                      {repo.is_private ? (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${langColors[repo.language] || "bg-gray-400"}`} />
                        {repo.language || "Unknown"}
                      </span>
                      {repo.stars !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                      )}
                      <span>
                        Last review: {repo.last_scanned_at ? new Date(repo.last_scanned_at).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-lg font-bold ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {score}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      runReviewMutation.mutate(repo.full_name);
                    }}
                    disabled={runReviewMutation.isPending && runReviewMutation.variables === repo.full_name}
                  >
                    {runReviewMutation.isPending && runReviewMutation.variables === repo.full_name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      "Run Review"
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/30">
          <MessageSquareCode className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No repositories connected</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Connect your first GitHub repository to start receiving AI-powered code reviews on your pull requests.
          </p>
          <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
            Connect Repository
          </Button>
        </div>
      )}

      {/* Connect Repo Modal */}
      <ConnectRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableRepos={availableRepos}
        isLoading={isLoadingAvailable}
        onConnect={async (id) => { await connectRepoMutation.mutateAsync(id); }}
      />
    </div>
  );
}
