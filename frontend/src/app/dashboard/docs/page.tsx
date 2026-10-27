"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const docTypes = [
  { title: "Function Documentation", description: "Auto-generate docstrings and function documentation.", icon: Code2, count: 24 },
  { title: "API Documentation", description: "Generate OpenAPI/Swagger-compatible API docs.", icon: FileText, count: 8 },
  { title: "README Generator", description: "Create comprehensive README files for repositories.", icon: BookOpen, count: 12 },
  { title: "Class Documentation", description: "Document classes, methods, and inheritance hierarchies.", icon: Sparkles, count: 18 },
];

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">Documentation</motion.h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered documentation generation.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docTypes.map((doc, i) => {
          const Icon = doc.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="glass-card-hover p-6">
              <Icon className="h-8 w-8 text-brand-400 mb-4" />
              <h3 className="font-semibold mb-1">{doc.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{doc.count} generated</span>
                <Button variant="outline" size="sm">Generate</Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
