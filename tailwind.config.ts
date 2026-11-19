import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#0A0A0C",
        surface: {
          DEFAULT: "#121216",
          raised: "#18181B",
          card: "#121216",
          highlight: "#222226",
        },
        border: {
          DEFAULT: "#27272A",
          subtle: "#18181B",
          bright: "#3F3F46",
        },
        accent: {
          DEFAULT: "#FFFFFF",
          hover: "#E4E4E7",
          light: "#A1A1AA",
          glow: "transparent",
        },
        cyan: {
          400: "#E4E4E7",
          500: "#A1A1AA",
          600: "#71717A",
        },
        saffron: {
          400: "#FFFFFF",
          500: "#E4E4E7",
          600: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.35s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
