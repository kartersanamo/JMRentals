"use client";

import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site-config";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero({
  name = site.name,
  tagline = site.tagline,
  heroImage = site.heroImage,
}: {
  name?: string;
  tagline?: string;
  heroImage?: string;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src={heroImage}
        alt="J&M Rentals property exterior in Larose, Louisiana"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 gradient-hero" aria-hidden />

      <div className="relative z-10 section-padding text-center max-w-5xl mx-auto pt-24">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xs md:text-sm uppercase tracking-[0.35em] text-gold mb-6"
        >
          Welcome to
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.05] text-balance"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 text-lg md:text-xl text-sand/95 max-w-2xl mx-auto leading-relaxed"
        >
          {tagline}. Experience renovated comfort and bayou-country charm
          in Larose, LA.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <ButtonLink href="/gallery" variant="primary" size="lg">
            View Gallery
          </ButtonLink>
          <ButtonLink href="/#contact" variant="ghost" size="lg">
            Contact Us
          </ButtonLink>
          <ButtonLink href="/book" variant="ghost" size="md" className="opacity-90">
            Book Online — Coming Soon
          </ButtonLink>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-cream/60 to-transparent" />
      </motion.div>
    </section>
  );
}
