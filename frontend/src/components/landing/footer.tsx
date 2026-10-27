"use client";

import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "#preview" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
    { label: "Community", href: "#" },
    { label: "Support", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@codepilot.ai", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background/50">
      <div className="section-container py-16">
        {/* CTA Banner */}
        <div className="relative glass-card p-8 sm:p-12 mb-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-brand-500/10" />
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to ship <span className="gradient-text">better code</span>?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join 12,000+ developers who use CodePilot AI to write cleaner,
              safer, and more maintainable code.
            </p>
            <Link
              href="/login"
              className="btn-gradient inline-flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">CodePilot AI</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Review Code Smarter.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border/50 gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CodePilot AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for developers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
