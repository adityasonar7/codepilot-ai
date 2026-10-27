"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";

/**
 * OAuth Callback Page
 * 
 * This page handles the redirect from GitHub after the user authorizes our app.
 * 
 * Flow:
 * 1. GitHub redirects here with ?code=XXXX in the URL
 * 2. We send that code to our backend POST /auth/github
 * 3. Backend exchanges it for a real GitHub access token
 * 4. Backend returns a JWT to us
 * 5. We save the JWT and redirect to /dashboard
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    // Send the code to our backend to exchange for tokens
    const exchangeCode = async () => {
      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from GitHub.");
        return;
      }

      try {
        const response = await api.post("/auth/github", { code });
        const { access_token } = response.data;

        // Save the JWT token
        localStorage.setItem("token", access_token);

        setStatus("success");

        // Redirect to dashboard after a brief success animation
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } catch (err: unknown) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setErrorMessage(
          message || "Failed to authenticate. Please try again."
        );
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center max-w-sm mx-4"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Authenticating...</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Exchanging your GitHub authorization code for a secure session.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">You&apos;re in!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Authentication Failed</h2>
            <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 text-sm text-brand-400 hover:underline"
            >
              ← Try again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
