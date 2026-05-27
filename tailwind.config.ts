import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bark: "#1f2933",
        walnut: "#38524c",
        cedar: "#d9e6df",
        clay: "#bfd3c7",
        terracotta: "#d9654b",
        sand: "#e7ddd2",
        linen: "#fbfaf6",
        sage: "#b9d0c4",
        moss: "#2f5d50",
        forest: "#173f35",
        mist: "#e1e8e2",
        dusk: "#17201d",
        blush: "#d9654b",
        cream: "#fbfaf6",
        stone: "#e1e8e2",
        ember: "#d9654b",
        maroon: "#38524c",
        gold: "#d6a756",
        graphite: "#1f2933",
        coffee_bean: {
          DEFAULT: "#173f35",
          100: "#17201d",
          200: "#1f2933",
          300: "#2f5d50",
          400: "#38524c",
          500: "#173f35",
          600: "#b9d0c4",
          700: "#d9e6df",
          800: "#e1e8e2",
          900: "#fbfaf6"
        },
        camel: {
          DEFAULT: "#e7ddd2",
          100: "#17201d",
          200: "#1f2933",
          300: "#38524c",
          400: "#bfd3c7",
          500: "#e7ddd2",
          600: "#e1e8e2",
          700: "#fbfaf6",
          800: "#fbfaf6",
          900: "#fbfaf6"
        },
        almond_cream: {
          DEFAULT: "#fbfaf6",
          100: "#17201d",
          200: "#1f2933",
          300: "#38524c",
          400: "#d9e6df",
          500: "#fbfaf6",
          600: "#fbfaf6",
          700: "#fbfaf6",
          800: "#fbfaf6",
          900: "#fbfaf6"
        },
        dusty_olive: {
          DEFAULT: "#2f5d50",
          100: "#17201d",
          200: "#1f2933",
          300: "#2f5d50",
          400: "#38524c",
          500: "#2f5d50",
          600: "#b9d0c4",
          700: "#d9e6df",
          800: "#e1e8e2",
          900: "#fbfaf6"
        },
        ebony: {
          DEFAULT: "#1f2933",
          100: "#17201d",
          200: "#17201d",
          300: "#1f2933",
          400: "#1f2933",
          500: "#38524c",
          600: "#2f5d50",
          700: "#bfd3c7",
          800: "#e1e8e2",
          900: "#fbfaf6"
        }
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(37, 36, 34, 0.14)",
        earthy: "0 18px 60px rgba(37, 36, 34, 0.18)",
        innerGlow: "inset 0 1px 0 rgba(255,255,255,0.28)"
      },
      backgroundImage: {
        woodgrain:
          "linear-gradient(115deg, rgba(255,255,255,0.05), rgba(0,0,0,0.05)), repeating-linear-gradient(92deg, rgba(255,255,255,0.045) 0 2px, rgba(0,0,0,0.025) 2px 5px, transparent 5px 14px)"
      }
    }
  },
  plugins: []
};

export default config;
