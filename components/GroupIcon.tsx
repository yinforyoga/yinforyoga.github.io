import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Three people, for the group offerings' medallion.
 *
 * Drawn here rather than imported because lucide's `Users` is two figures — one
 * whole and one implied by an arc — and at medallion size that reads as a pair
 * rather than as a class. This version keeps a whole figure in front and puts a
 * head and a shoulder line on either side of it, so the count is legible at
 * 18px without the icon turning into texture.
 *
 * Every value follows lucide's own conventions so it sits beside `User` and the
 * card's other glyphs without looking imported from somewhere else: a 24 unit
 * box, no fill, `currentColor`, round caps and joins, and a stroke width the
 * caller sets. The flanking figures are drawn smaller and lower, which is what
 * puts them behind the middle one rather than merely beside it.
 */
export const UsersThree = forwardRef<SVGSVGElement, LucideProps>(
  function UsersThree(
    { size = 24, strokeWidth = 2, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* The figure in front, whole. */}
        <circle cx="12" cy="8" r="3.1" />
        <path d="M16.6 21v-1.4a4.6 4.6 0 0 0-9.2 0V21" />
        {/* Flanking the pair behind: a head each, and the shoulder that says
            there is a body under it without drawing one. */}
        <circle cx="4.6" cy="10.4" r="2.1" />
        <path d="M1.8 19.4v-.9a3.3 3.3 0 0 1 3.3-3.3" />
        <circle cx="19.4" cy="10.4" r="2.1" />
        <path d="M22.2 19.4v-.9a3.3 3.3 0 0 0-3.3-3.3" />
      </svg>
    );
  },
) as unknown as LucideIcon;
