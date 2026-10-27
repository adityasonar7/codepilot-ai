"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does CodePilot AI analyze my code?",
    answer:
      "CodePilot AI downloads the PR diff from GitHub, parses the changes, and sends them to our AI engine (powered by Gemini). The AI acts as a Senior Staff Engineer, analyzing for bugs, security vulnerabilities, performance issues, code smells, and more. Results are returned with line numbers, severity levels, explanations, and suggested fixes.",
  },
  {
    question: "Is my code stored or used for training?",
    answer:
      "No. Your code is never stored on our servers beyond the duration of the review. We do not use your code for AI model training. All analysis happens in-memory and results are discarded after delivery. We take code privacy extremely seriously.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "CodePilot AI supports all major programming languages including Python, JavaScript, TypeScript, Java, Go, Rust, C++, Ruby, PHP, Swift, Kotlin, and more. The AI adapts its review patterns based on language-specific best practices and conventions.",
  },
  {
    question: "Can I self-host CodePilot AI?",
    answer:
      "Yes! Enterprise plan includes a self-hosted option with Docker deployment. You can run CodePilot AI entirely within your own infrastructure, ensuring complete data sovereignty. We provide Docker Compose configs and Kubernetes Helm charts.",
  },
  {
    question: "How accurate are the AI reviews?",
    answer:
      "Our AI maintains a 99.2% accuracy rate across reviews. We combine static analysis tools (Pylint, Flake8, Bandit, Semgrep) with AI-powered analysis to minimize false positives. Each finding includes a confidence score and severity rating.",
  },
  {
    question: "Does CodePilot AI integrate with my CI/CD pipeline?",
    answer:
      "Absolutely. CodePilot AI integrates via GitHub Webhooks to automatically review new pull requests. It can post inline comments, block merges on critical issues, and integrate with Slack, Discord, and email notifications.",
  },
  {
    question: "What's the difference between Free and Pro?",
    answer:
      "The Free plan is perfect for individual developers with up to 3 repositories and 50 reviews per month. Pro unlocks unlimited repos and reviews, advanced security scanning, performance analysis, auto-fix with AI, documentation generation, and team features.",
  },
  {
    question: "Can I try Pro features before subscribing?",
    answer:
      "Yes! Every new account gets a 14-day free trial of Pro features. No credit card required. You can experience the full power of CodePilot AI before making a decision.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24">
      <div className="section-container relative z-10 max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about CodePilot AI.
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-accent/30 transition-colors"
              >
                <span className="text-sm font-medium pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
