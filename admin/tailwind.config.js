/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        "cream-dark": "#F3ECE1",
        sand: "#EFE6DA",
        line: "#E2D7C8",
        maroon: {
          DEFAULT: "#62190D",
          deep: "#450F07",
          light: "#7D2213",
          surface: "#FBF3F1",
        },
        gold: {
          DEFAULT: "#D4AF37",
          muted: "#C5A059",
          light: "#F7F2E6",
        },
        ink: {
          DEFAULT: "#1F1A17",
          light: "#4A4036",
        },
        muted: "#7A6E63",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        sans: ["Jost", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 4px 20px -2px rgba(98, 25, 13, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};
