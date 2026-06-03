"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface AnimateInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function AnimateIn({
  children,
  delay = 0,
  className,
  ...props
}: AnimateInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
