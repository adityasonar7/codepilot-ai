"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Gauge,
  GitPullRequest,
  FileText,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Review",
    description:
      "Get instant, intelligent code reviews powered by Gemini AI. Identifies bugs, code smells, and anti-patterns like a Senior Staff Engineer.",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Shield,
    title: "Security Scanner",
    description:
      "Detect SQL injection, XSS, hardcoded secrets, unsafe deserialization, and 50+ vulnerability patterns automatically.",
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: Gauge,
    title: "Performance Analyzer",
    description:
      "Find N+1 queries, memory leaks, blocking calls, and inefficient algorithms before they hit production.",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: GitPullRequest,
    title: "PR Assistant",
    description:
      "Automatically analyze pull requests on push. Get inline comments, severity ratings, and suggested fixes.",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: FileText,
    title: "Documentation Generator",
    description:
      "Auto-generate function docs, class docs, API documentation, READMEs, and inline docstrings.",
    gradient: "from-pink-500 to-rose-500",
    glowColor: "rgba(244, 63, 94, 0.15)",
  },
  {
    icon: BarChart3,
    title: "Code Complexity Analyzer",
    description:
      "Measure cyclomatic complexity, cognitive complexity, and maintainability index with detailed reports.",
    gradient: "from-indigo-500 to-blue-500",
    glowColor: "rgba(99, 102, 241, 0.15)",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything you need for{" "}
            <span className="gradient-text">better code</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive suite of AI-powered tools to catch bugs, enforce
            standards, and ship quality code faster.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card-hover group p-6 sm:p-8"
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg transition-transform group-hover:scale-110`}
                  style={{
                    boxShadow: `0 8px 25px ${feature.glowColor}`,
                  }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom glow on hover */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
