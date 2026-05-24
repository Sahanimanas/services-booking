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
        // Royal blue — the "S" in the GSM mark
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8", // primary
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
          950: "#0c1738",
        },
        // Vibrant orange — the "M" + figure in the GSM mark
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // primary accent
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(29, 78, 216, 0.12)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 55%, #f97316 100%)",
        "brand-soft": "linear-gradient(135deg, #eff6ff 0%, #fff7ed 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
