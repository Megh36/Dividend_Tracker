import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F7F5F0",
          card: "#EDE9E0",
          subtle: "#E4DFD5",
          inverse: "#1A1A1A",
        },
        border: {
          DEFAULT: "#D5CFC4",
          strong: "#C4BDB1",
          faint: "#E4DFD5",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#555248",
          muted: "#8C877E",
          inverse: "#F7F5F0",
        },
        accent: {
          DEFAULT: "#C0392B",
          hover: "#A93226",
          light: "#F5E6E4",
        },
        gain: {
          DEFAULT: "#27AE60",
          light: "#E9F7EF",
        },
        loss: {
          DEFAULT: "#C0392B",
          light: "#F5E6E4",
        },
        urgent: "#C0392B",
        warning: "#E67E22",
        safe: "#8C877E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)",
        "card-hover": "0 4px 12px rgba(26,26,26,0.10), 0 2px 4px rgba(26,26,26,0.06)",
        "card-active": "0 1px 2px rgba(26,26,26,0.08)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
