"use client";

import { Menu, Moon, SunMedium, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/data";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(navItems[0]?.href ?? "#home");
  const pillRef = useRef<HTMLSpanElement>(null);
  const hoverPillRef = useRef<HTMLSpanElement>(null);
  const hoverFrameRef = useRef(0);
  const hoverSessionActiveRef = useRef(false);
  const desktopLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const { theme, toggleTheme } = useTheme();

  const showHoverPill = (index: number, isActive: boolean) => {
    const hoverPill = hoverPillRef.current;
    const pill = pillRef.current;
    const link = desktopLinkRefs.current[index];

    cancelAnimationFrame(hoverFrameRef.current);

    if (!hoverPill || !pill || !link || isActive) {
      if (hoverPill) hoverPill.style.opacity = "0";
      return;
    }

    if (!hoverSessionActiveRef.current) {
      hoverPill.style.transition = "none";
      hoverPill.style.transform = pill.style.transform;
      hoverPill.style.width = pill.style.width;
      hoverPill.style.opacity = "0";
      void hoverPill.offsetWidth;
      hoverSessionActiveRef.current = true;
    }

    hoverFrameRef.current = requestAnimationFrame(() => {
      hoverPill.style.transition = "";
      hoverPill.style.transform = `translate3d(${link.offsetLeft}px, 0, 0)`;
      hoverPill.style.width = `${link.offsetWidth}px`;
      hoverPill.style.opacity = "1";
    });
  };

  const hideHoverPill = () => {
    cancelAnimationFrame(hoverFrameRef.current);
    hoverSessionActiveRef.current = false;
    if (hoverPillRef.current) hoverPillRef.current.style.opacity = "0";
  };

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.slice(1));

    let animationFrame = 0;

    const updateNavigation = () => {
      setIsScrolled(window.scrollY > 12);

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));

      if (sections.length === 0) {
        return;
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const anchors = sections.map((section) => Math.min(section.offsetTop, maxScroll));
      let currentIndex = anchors.findLastIndex((anchor) => anchor <= window.scrollY + 1);
      currentIndex = Math.max(0, currentIndex);
      setActiveSection(`#${sections[currentIndex].id}`);

      const pill = pillRef.current;
      const currentLink = desktopLinkRefs.current[currentIndex];
      if (!pill || !currentLink) {
        return;
      }

      const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
      const nextLink = desktopLinkRefs.current[nextIndex] ?? currentLink;
      const interval = anchors[nextIndex] - anchors[currentIndex];
      const progress = interval > 0
        ? Math.min(1, Math.max(0, (window.scrollY - anchors[currentIndex]) / interval))
        : 0;
      const left = currentLink.offsetLeft + (nextLink.offsetLeft - currentLink.offsetLeft) * progress;
      const width = currentLink.offsetWidth + (nextLink.offsetWidth - currentLink.offsetWidth) * progress;

      pill.style.transform = `translate3d(${left}px, 0, 0)`;
      pill.style.width = `${width}px`;
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateNavigation);
    };

    updateNavigation();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(hoverFrameRef.current);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isScrolled ? "px-0 pt-0" : "px-4 pt-4"
      }`}
    >
      <div
        className={`site-nav mx-auto flex w-full items-center justify-between border px-4 py-3 backdrop-blur-2xl transition-[max-width,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isScrolled ? "max-w-[100vw] rounded-none" : "max-w-7xl rounded-[32px]"
        }`}
      >
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

        <nav
          className="relative hidden items-center gap-7 lg:flex"
          aria-label="Main navigation"
          onPointerLeave={hideHoverPill}
        >
          <span ref={pillRef} className="site-nav-pill pointer-events-none absolute inset-y-0 left-0" aria-hidden="true" />
          <span ref={hoverPillRef} className="site-nav-pill-ghost pointer-events-none absolute inset-y-0 left-0" aria-hidden="true" />
          {navItems.map((item, index) => {
            const isActive = activeSection === item.href;

            return (
              <a
                key={item.href}
                ref={(element) => { desktopLinkRefs.current[index] = element; }}
                href={item.href}
                onClick={() => setActiveSection(item.href)}
                onPointerEnter={() => showHoverPill(index, isActive)}
                aria-current={isActive ? "page" : undefined}
                className={`site-nav-link relative z-10 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "site-nav-link-current" : "site-nav-link-idle"
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
