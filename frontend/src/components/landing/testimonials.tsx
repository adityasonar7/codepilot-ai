"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Staff Engineer",
    company: "Stripe",
    avatar: "SC",
    rating: 5,
    text: "CodePilot AI catches issues our entire team misses. It reduced our bug count in production by 40% in the first month. The security scanner alone is worth the price.",
  },
  {
    name: "Marcus Johnson",
    role: "Engineering Lead",
    company: "Vercel",
    avatar: "MJ",
    rating: 5,
    text: "We integrated CodePilot into our CI/CD pipeline and it's been a game changer. Reviews that used to take hours now happen in seconds with incredible accuracy.",
  },
  {
    name: "Priya Patel",
    role: "CTO",
    company: "Linear",
    avatar: "PP",
    rating: 5,
    text: "The AI review quality is genuinely impressive. It understands context, suggests actual improvements, and the inline review UI is the best I've seen. Period.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24">
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
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Loved by <span className="gradient-text">developers</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what engineering teams at top companies say about CodePilot AI.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              className="glass-card-hover p-6 sm:p-8 flex flex-col"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-brand-500/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
