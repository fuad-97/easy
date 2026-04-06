import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2B1D0E",
        sand: "#FFF7ED",
        peach: "#FED7AA",
        terracotta: "#C2410C",
        olive: "#5F6F52"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(120, 53, 15, 0.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
