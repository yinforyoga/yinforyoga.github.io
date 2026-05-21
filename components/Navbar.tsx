"use client";

import { Menu, Moon, SunMedium, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/data";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(navItems[0]?.href ?? "#home");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.slice(1));

    const updateActiveSection = () => {
      const scrollLine = window.scrollY + window.innerHeight * 0.35;
      const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));

      if (pageBottom && sections.length > 0) {
        setActiveSection(`#${sections[sections.length - 1].id}`);
        return;
      }

      const currentSection = sections.find((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        return top <= scrollLine && bottom > scrollLine;
      });

      if (currentSection) {
        setActiveSection(`#${currentSection.id}`);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-coffee_bean-500/10 bg-linen/70 px-4 py-3 shadow-soft backdrop-blur-2xl transition dark:border-almond_cream-700/10 dark:bg-bark/72">
        <a href="#home" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-coffee_bean-800/30 bg-gradient-to-br from-coffee_bean-500 via-walnut to-bark text-sm font-bold text-linen shadow-innerGlow dark:border-almond_cream-600/20 dark:from-almond_cream-800 dark:via-camel-700 dark:to-coffee_bean-600 dark:text-bark">
            Y
          </span>
          <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-bark dark:text-almond_cream-700">
            Yin for Yoga
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-sage/50 text-forest shadow-innerGlow dark:bg-white/10 dark:text-sage"
                    : "text-walnut/78 hover:text-forest dark:text-linen/72 dark:hover:text-sage"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white/45 text-forest transition hover:bg-sage/45 dark:border-white/10 dark:bg-white/5 dark:text-linen"
            aria-label="Toggle earthy dark mode"
          >
            {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white/45 text-forest transition hover:bg-sage/45 dark:border-white/10 dark:bg-white/5 dark:text-linen lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="mx-auto mt-3 grid max-w-7xl gap-2 rounded-[28px] border border-white/20 bg-linen/90 p-4 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-bark/92 lg:hidden">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  setActiveSection(item.href);
                  setOpen(false);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-sage/50 text-forest shadow-innerGlow dark:bg-white/10 dark:text-sage"
                    : "text-forest hover:bg-sage/40 dark:text-linen"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
