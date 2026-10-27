"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, GitBranch, Lock, Globe, Plus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  language: string;
  default_branch: string;
  stargazers_count: number;
  is_connected: boolean;
}

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRepos: GitHubRepo[];
  isLoading: boolean;
  onConnect: (repoId: number) => Promise<void>;
}

export function ConnectRepoModal({
  isOpen,
  onClose,
  availableRepos,
  isLoading,
  onConnect,
}: ConnectRepoModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingId, setConnectingId] = useState<number | null>(null);

  const filteredRepos = availableRepos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = async (repoId: number) => {
    setConnectingId(repoId);
    try {
      await onConnect(repoId);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Connect Repository</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a repository from your GitHub account to enable AI reviews.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border/50 bg-secondary/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search your repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50"
                  />
                </div>
              </div>

              {/* Repo List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                  </div>
                ) : filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-4 rounded-xl border border-border/50 bg-card hover:border-brand-500/30 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <GitBranch className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{repo.full_name}</span>
                            {repo.private ? (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-sm">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {repo.language && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 hidden sm:flex">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            {repo.language}
                          </span>
                        )}
                        
                        {repo.is_connected ? (
                          <Button variant="outline" size="sm" disabled className="gap-2">
                            <Check className="h-4 w-4 text-emerald-500" />
                            Connected
                          </Button>
                        ) : (
                          <Button
                            variant="gradient"
                            size="sm"
                            className="gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            onClick={() => handleConnect(repo.id)}
                            disabled={connectingId === repo.id}
                          >
                            {connectingId === repo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No repositories found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
