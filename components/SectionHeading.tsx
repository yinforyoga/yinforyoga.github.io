import { FadeUp } from "./MotionPrimitives";

export function SectionHeading({
  eyebrow,
  align = "left",
  inverse = false
}: {
  eyebrow: string;
  align?: "left" | "center";
  inverse?: boolean;
}) {
  return (
    <FadeUp
      className={`mb-7 ${
        align === "center"
          ? "mx-auto text-center"
          : "text-center sm:text-left"
      }`}
    >
      <h2
        className={`text-sm font-extrabold uppercase tracking-[0.28em] ${
          inverse ? "text-clay" : "text-moss dark:text-sage"
        }`}
      >
        {eyebrow}
      </h2>
    </FadeUp>
  );
}
