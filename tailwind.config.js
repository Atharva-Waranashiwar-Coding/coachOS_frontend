/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        canvas: "#f4f6f3",
        line: "#dce3dd",
        brand: {
          50: "#edf8f1",
          100: "#d5efdd",
          500: "#23814a",
          600: "#196b3b",
          700: "#155632",
        },
        signal: "#e0a11b",
      },
      boxShadow: {
        panel:
          "0 1px 2px rgb(23 33 27 / 0.05), 0 8px 24px rgb(23 33 27 / 0.04)",
      },
    },
  },
  plugins: [],
};
