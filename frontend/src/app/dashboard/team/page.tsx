"use client";

import { motion } from "framer-motion";
import { Crown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const members = [
  { name: "Adiso", email: "adiso@email.com", role: "Owner", avatar: "A", status: "active" },
  { name: "Sarah Chen", email: "sarah@company.com", role: "Admin", avatar: "SC", status: "active" },
  { name: "Marcus Johnson", email: "marcus@company.com", role: "Member", avatar: "MJ", status: "active" },
  { name: "Priya Patel", email: "priya@company.com", role: "Member", avatar: "PP", status: "invited" },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">Team</motion.h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team members and permissions.</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>
      <div className="space-y-2">
        {members.map((member, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
                {member.avatar}
              </div>
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {member.name}
                  {member.role === "Owner" && <Crown className="h-3 w-3 text-amber-400" />}
                </div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${member.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {member.status}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">{member.role}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
