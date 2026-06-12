import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f14",
        panel: "#131922",
        line: "#232b36",
        muted: "#7d8a9c",
        paper: "#e8ecf1",
        pitch: "#1f8a5a",
        spoon: "#c9742c",
        spoonlight: "#f0b35e",
        alert: "#e2483d",
        gold: "#d4af37",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        plate: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 50px -20px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        scoreboard:
          "repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
