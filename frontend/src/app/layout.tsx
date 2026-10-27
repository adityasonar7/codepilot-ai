import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ReactQueryProvider } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodePilot AI — Review Code Smarter",
  description:
    "AI-powered GitHub code review platform. Detect bugs, security vulnerabilities, performance issues, and code smells with the intelligence of a Senior Staff Engineer.",
  keywords: [
    "code review",
    "AI",
    "GitHub",
    "pull request",
    "code quality",
    "security scanner",
    "performance analyzer",
  ],
  authors: [{ name: "CodePilot AI" }],
  openGraph: {
    title: "CodePilot AI — Review Code Smarter",
    description:
      "AI-powered GitHub code review platform that detects bugs, security vulnerabilities, and code smells.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
