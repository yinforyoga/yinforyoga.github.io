"use client";

import { MotionDiv, Parallax } from "./MotionPrimitives";

export function OrganicVisual() {
  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-[34px] border border-almond_cream-700/25 bg-woodgrain shadow-earthy md:min-h-[620px]">
      <MotionDiv
        className="absolute -left-16 top-16 h-64 w-64 organic-radius bg-sage/70 blur-sm"
        animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionDiv
        className="absolute right-8 top-10 h-44 w-44 organic-radius bg-blush/70"
        animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionDiv
        className="absolute bottom-12 right-16 h-72 w-72 organic-radius bg-terracotta/28"
        animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <Parallax offset={-45} className="absolute inset-x-12 bottom-0 h-[78%]">
        <div className="mx-auto h-full max-w-[330px] rounded-t-full border-x border-t border-linen/30 bg-gradient-to-b from-linen/48 via-blush/28 to-transparent shadow-innerGlow">
          <div className="mx-auto mt-14 h-16 w-16 rounded-full bg-linen/85 shadow-soft" />
          <div className="mx-auto mt-6 h-44 w-24 rounded-t-[60px] bg-linen/42" />
          <div className="mx-auto -mt-3 h-4 w-72 rounded-full bg-blush/45" />
          <div className="mx-auto mt-14 h-3 w-56 rounded-full bg-sage/75" />
        </div>
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-t from-bark/62 via-transparent to-linen/8" />
      <div className="absolute bottom-7 left-7 right-7 rounded-[24px] border border-linen/16 bg-bark/52 p-5 text-linen backdrop-blur-xl">
        <p className="font-serif text-3xl leading-none">Slow strength. Soft attention.</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-linen/74">
          A visual language of breath, wood, grounded training, and emotional steadiness.
        </p>
      </div>
    </div>
  );
}
