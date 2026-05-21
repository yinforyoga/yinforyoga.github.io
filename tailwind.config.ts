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
        bark: "#252422",
        walnut: "#472d30",
        cedar: "#7f5539",
        clay: "#a68a64",
        terracotta: "#e26d5c",
        sand: "#ede0d4",
        linen: "#fffcf2",
        sage: "#c9cba3",
        moss: "#656d4a",
        forest: "#414833",
        mist: "#cfdbd5",
        dusk: "#333533",
        blush: "#ffe1a8",
        cream: "#e8eddf",
        stone: "#ccc5b9",
        ember: "#eb5e28",
        maroon: "#723d46",
        gold: "#f5cb5c",
        graphite: "#242423",
        coffee_bean: {
          DEFAULT: "#7f5539",
          100: "#19110b",
          200: "#332217",
          300: "#4c3322",
          400: "#65442e",
          500: "#7f5539",
          600: "#ac734d",
          700: "#c29678",
          800: "#d7b9a5",
          900: "#ebdcd2"
        },
        camel: {
          DEFAULT: "#a68a64",
          100: "#221c13",
          200: "#433727",
          300: "#65533a",
          400: "#876f4d",
          500: "#a68a64",
          600: "#b8a183",
          700: "#c9b9a2",
          800: "#dbd0c1",
          900: "#ede8e0"
        },
        almond_cream: {
          DEFAULT: "#ede0d4",
          100: "#3f2c1a",
          200: "#7f5935",
          300: "#b88555",
          400: "#d2b295",
          500: "#ede0d4",
          600: "#f1e6dc",
          700: "#f4ece5",
          800: "#f8f3ee",
          900: "#fbf9f6"
        },
        dusty_olive: {
          DEFAULT: "#656d4a",
          100: "#14160f",
          200: "#282c1e",
          300: "#3d422d",
          400: "#51573b",
          500: "#656d4a",
          600: "#899465",
          700: "#a7b08a",
          800: "#c4cab1",
          900: "#e2e5d8"
        },
        ebony: {
          DEFAULT: "#414833",
          100: "#0d0e0a",
          200: "#1a1d14",
          300: "#272b1e",
          400: "#343929",
          500: "#414833",
          600: "#6a7553",
          700: "#919e77",
          800: "#b6bfa4",
          900: "#dadfd2"
        }
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(37, 36, 34, 0.16)",
        earthy: "0 18px 60px rgba(71, 45, 48, 0.18)",
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
