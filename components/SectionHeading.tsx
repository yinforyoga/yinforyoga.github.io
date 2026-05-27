import { FadeUp } from "./MotionPrimitives";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  inverse = false
}: {
  eyebrow: string;
  title: string;
  copy: string;
  align?: "left" | "center";
  inverse?: boolean;
}) {
  return (
    <FadeUp
      className={`mb-12 max-w-3xl ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      <p
        className={`mb-4 text-xs font-extrabold uppercase tracking-[0.32em] ${
          inverse ? "text-clay" : "text-moss dark:text-sage"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-balance font-serif text-3xl font-medium leading-tight md:text-5xl ${
          inverse ? "text-linen" : "text-forest dark:text-linen"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 text-sm leading-7 md:text-base ${
          inverse ? "text-linen/68" : "text-[color:var(--muted)]"
        }`}
      >
        {copy}
      </p>
    </FadeUp>
  );
}
