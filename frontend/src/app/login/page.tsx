"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Sparkles, ArrowRight, Shield, Lock, Zap, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

/**
 * Login page with GitHub OAuth and Instant Guest/Demo mode.
 */
export default function LoginPage() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();

  const handleGitHubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23liGuN851SU2A4luN";
    const redirectUri = encodeURIComponent("http://localhost:3000/auth/callback");
    const scope = encodeURIComponent("repo user:email read:org");

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.post("/auth/demo");
      if (res.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Demo login error:", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-hero-gradient">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="glow-orb w-[500px] h-[500px] top-[-200px] right-[-200px]" />
      <div className="glow-orb w-[400px] h-[400px] bottom-[-150px] left-[-150px]" style={{ animationDelay: "3s" }} />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 shadow-glow mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to CodePilot AI
            </p>
          </div>

          {/* GitHub OAuth Button */}
          <Button
            variant="gradient"
            size="xl"
            className="w-full gap-2.5 mb-3 group"
            onClick={handleGitHubLogin}
          >
            <Github className="h-5 w-5" />
            <span>Continue with GitHub</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          {/* Instant Guest / Demo Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2.5 mb-4 border-brand-500/30 hover:bg-brand-500/10 text-foreground"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
            ) : (
              <PlayCircle className="h-4 w-4 text-emerald-400" />
            )}
            <span>Instant Demo / Guest Access</span>
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">
                Zero setup required to explore
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>We only request read access to your repositories</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-brand-400 flex-shrink-0" />
              <span>Your code is never stored or used for training</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>Powered by Google Gemini 2.0 Flash</span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground/60 text-center mt-6">
            By signing in, you agree to our{" "}
            <Link href="/" className="underline hover:text-foreground">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
