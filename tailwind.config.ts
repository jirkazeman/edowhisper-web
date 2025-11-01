import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          50: "#fff5f3",
          100: "#ffe8e3",
          200: "#ffd4cc",
          300: "#ffb8a8",
          400: "#ff8c73",
          500: "#ff6b4a",
          600: "#f04822",
          700: "#cc3311",
          800: "#a52914",
          900: "#7a1f10",
        },
      },
    },
  },
  plugins: [],
};
export default config;
