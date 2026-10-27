"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Play, ArrowRight, Shield, Zap, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ── Floating Code Snippets ──────────────────────────────────── */
const codeSnippets = [
  {
    code: `// 🐛 Bug detected: potential null reference
if (user.profile.settings) {
  applyTheme(user.profile.settings);
}`,
    language: "typescript",
    delay: 0,
    position: "top-[15%] left-[5%]",
    rotation: -3,
  },
  {
    code: `# 🔒 Security: SQL injection risk
query = f"SELECT * FROM users WHERE id = {user_id}"
# Fix: Use parameterized queries
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`,
    language: "python",
    delay: 0.5,
    position: "top-[25%] right-[3%]",
    rotation: 2,
  },
  {
    code: `// ⚡ Performance: N+1 query detected
const users = await User.findAll();
for (const user of users) {
  const posts = await Post.findAll({ userId: user.id });
}`,
    language: "javascript",
    delay: 1,
    position: "bottom-[20%] left-[8%]",
    rotation: -2,
  },
];

/* ── Stats Bar ───────────────────────────────────────────────── */
const stats = [
  { value: "50K+", label: "Reviews Completed" },
  { value: "99.2%", label: "Accuracy Rate" },
  { value: "3.5s", label: "Average Review Time" },
  { value: "12K+", label: "Developers" },
];

export function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Review Code Smarter.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index >= fullText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient pt-16">
      {/* ── Background Effects ───────────────────────────────── */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Glow orbs */}
      <div className="glow-orb w-[600px] h-[600px] top-[-200px] left-[-200px]" />
      <div
        className="glow-orb w-[500px] h-[500px] bottom-[-150px] right-[-150px]"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="glow-orb w-[300px] h-[300px] top-[40%] left-[50%]"
        style={{ animationDelay: "4s", opacity: 0.1 }}
      />

      {/* Gradient lines */}
      <div className="glow-line top-[30%] opacity-30" />
      <div className="glow-line top-[70%] opacity-20" />

      {/* ── Floating Code Snippets ───────────────────────────── */}
      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: snippet.delay + 0.5, duration: 0.8 }}
          className={`absolute ${snippet.position} hidden lg:block z-10`}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ rotate: snippet.rotation }}
            className="glass-card p-4 max-w-[280px] text-xs font-mono opacity-60 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[10px] text-muted-foreground">
                {snippet.language}
              </span>
            </div>
            <pre className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {snippet.code}
            </pre>
          </motion.div>
        </motion.div>
      ))}

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="relative z-20 section-container text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm mb-8"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Powered by Gemini AI</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          <span className="text-foreground">AI-Powered</span>
          <br />
          <span className="gradient-text">Code Reviews</span>
          <br />
          <span className="text-foreground">for Modern Teams</span>
        </motion.h1>

        {/* Tagline with typewriter */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4"
        >
          {typedText}
          <span className="animate-pulse text-brand-400">|</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm sm:text-base text-muted-foreground/70 max-w-xl mx-auto mb-10"
        >
          Detect bugs, security vulnerabilities, performance issues, and code
          smells instantly. Like having a Senior Staff Engineer review every PR.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button variant="gradient" size="xl" className="gap-2.5 group">
              <Github className="h-5 w-5" />
              <span>Login with GitHub</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="xl"
            className="gap-2.5 border-border/50 hover:border-brand-500/30"
          >
            <Play className="h-4 w-4 text-brand-400" />
            <span>Watch Demo</span>
          </Button>
        </motion.div>

        {/* Trust Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-6 mt-10 text-muted-foreground/50 text-sm"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-brand-400" />
            <span>Open Source</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>&lt; 5s Reviews</span>
          </div>
        </motion.div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-20 w-full mt-20 mb-0"
      >
        <div className="glass-card mx-4 sm:mx-8 lg:mx-auto lg:max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text-brand">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
