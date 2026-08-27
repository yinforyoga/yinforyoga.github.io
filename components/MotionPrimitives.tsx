"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
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

/**
 * Opens and closes a region by animating its measured height — the motion the
 * offering cards' drawer already uses, lifted here so everything that discloses
 * on this site moves the same way rather than each place inventing its own.
 *
 * A measured pixel height rather than `grid-template-rows` 0fr → 1fr, because
 * 1fr resolves to whatever the content happens to be: the resolved value never
 * changes when one piece of content replaces another, so a swap would resize in
 * a single frame instead of travelling.
 *
 * Held open, it still animates: the height tracks whatever the children
 * currently need, so content that grows or shrinks in place glides rather than
 * jumping. That is what makes it useful for a region whose buttons come and go.
 */
export function Collapse({
  id,
  open = true,
  className = "",
  children,
}: {
  id?: string;
  open?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  // Until the first measurement lands, an open region is left to size itself.
  // Rendering it at a measured 0 first would play an expand animation on every
  // page load, for a region that was never closed.
  const [measured, setMeasured] = useState(false);

  // Re-measure before paint whenever the content changes, so a swap transitions
  // straight to the new height. A ResizeObserver alone reports one frame late,
  // which animates towards the outgoing content's height first.
  useLayoutEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.offsetHeight);
    setMeasured(true);
  }, [children]);

  // Content also resizes without React re-rendering — reflow on a viewport
  // change, or a webfont landing after first paint.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() =>
      setHeight(content.offsetHeight),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      inert={!open}
      className={`overflow-hidden transition-[height] duration-300 ease-out ${className}`}
      style={
        measured ? { height: open ? height : 0 } : open ? undefined : { height: 0 }
      }
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
