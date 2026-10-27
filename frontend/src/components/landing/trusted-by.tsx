"use client";

import { motion } from "framer-motion";

const companies = [
  "Google",
  "Microsoft",
  "Stripe",
  "Vercel",
  "Netflix",
  "Shopify",
  "Figma",
  "Linear",
  "Notion",
  "GitHub",
  "GitLab",
  "Atlassian",
];

export function TrustedBySection() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="section-container text-center mb-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-widest text-muted-foreground/60"
        >
          Trusted by engineers at
        </motion.p>
      </div>

      {/* Infinite scroll logos */}
      <div className="relative mask-edges">
        <div className="flex animate-scroll-left">
          {[...companies, ...companies].map((company, i) => (
            <div
              key={`${company}-${i}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <span className="text-lg font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors whitespace-nowrap">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle divider */}
      <div className="glow-line bottom-0 opacity-10" />
    </section>
  );
}
