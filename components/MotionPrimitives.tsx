"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export function FadeUp({
  children,
  className = "",
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function Parallax({
  children,
  className = "",
  offset = 70
}: {
  children?: ReactNode;
  className?: string;
  offset?: number;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
