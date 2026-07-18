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
      <div className="site-nav mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 backdrop-blur-2xl transition">
        <a href="#offerings" className="flex items-center gap-3">
          <span className="site-nav-mark grid h-9 w-9 place-items-center rounded-full border text-sm font-bold shadow-innerGlow">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,8,17,8,17,8Z"
              />
            </svg>
          </span>
          <span className="site-nav-brand text-sm font-extrabold uppercase tracking-[0.22em]">
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
                className={`site-nav-link rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "site-nav-link-active shadow-innerGlow" : "site-nav-link-idle"
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
            className="site-nav-icon-button grid h-10 w-10 place-items-center rounded-full border transition"
            aria-label="Toggle earthy dark mode"
          >
            {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="site-nav-icon-button grid h-10 w-10 place-items-center rounded-full border transition lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="site-nav-mobile mx-auto mt-3 grid max-w-7xl gap-2 rounded-[28px] border p-4 backdrop-blur-2xl lg:hidden">
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
                className={`site-nav-link rounded-full px-4 py-3 text-sm font-bold transition ${
                  isActive ? "site-nav-link-active shadow-innerGlow" : "site-nav-link-idle"
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
