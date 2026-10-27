"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Palette, Moon, Sun, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  bio?: string;
  role: string;
  plan: string;
  review_count: number;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [resetSuccess, setResetSuccess] = useState(false);

  const { data: user } = useQuery<UserProfile>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/reset");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
          Settings
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, preferences, and data resets.
        </p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="font-semibold">Profile Details</h2>
            <p className="text-xs text-muted-foreground">Manage your identity and plan tier.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Display Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || user?.username || "Developer"}
                className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Username</label>
              <input
                type="text"
                readOnly
                value={user?.username || "demo_user"}
                className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Email</label>
            <input
              type="text"
              readOnly
              value={user?.email || "developer@codepilot.ai"}
              className="w-full h-10 px-3 rounded-lg border border-border/50 bg-secondary/50 text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Customize your visual interface theme.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              theme === "dark"
                ? "border-brand-500 bg-brand-500/10 text-brand-400 shadow-glow"
                : "border-border/50 hover:bg-accent"
            }`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              theme === "light"
                ? "border-brand-500 bg-brand-500/10 text-brand-400 shadow-glow"
                : "border-border/50 hover:bg-accent"
            }`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
        </div>
      </motion.div>

      {/* Danger Zone / Data Management */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-6 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-4">
          <RotateCcw className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="font-semibold text-amber-400">Account Data & Metrics Reset</h2>
            <p className="text-xs text-muted-foreground">
              Clear your review history and reset all dashboard scores to zero for a fresh start.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-2"
          >
            {resetMutation.isPending ? "Resetting..." : "Reset All Review History"}
          </Button>
          {resetSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Dashboard successfully reset!
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
