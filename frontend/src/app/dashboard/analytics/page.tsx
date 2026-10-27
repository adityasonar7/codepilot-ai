"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
          Analytics
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track code quality trends and team performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["Code Quality Trend", "Issue Trend", "Developer Activity", "Review Time"].map((chart, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{chart}</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                +12%
              </div>
            </div>
            <div className="h-48 flex items-center justify-center text-muted-foreground/30">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs">Chart coming in Phase 2</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
