"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`max-w-3xl mb-14 ${alignClass}`}
    >
      {eyebrow && (
        <p
          className={`text-xs uppercase tracking-[0.3em] mb-4 font-medium ${
            light ? "text-gold" : "text-gold"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-4xl md:text-5xl lg:text-6xl leading-tight text-balance ${
          light ? "text-cream" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-lg leading-relaxed ${
            light ? "text-sand/90" : "text-navy/70"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
