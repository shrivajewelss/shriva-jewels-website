/** Design tokens live in src/styles/index.css (CSS variables) and are exposed here. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--cream-rgb) / <alpha-value>)",
        sand: "rgb(var(--sand-rgb) / <alpha-value>)",
        maroon: "rgb(var(--maroon-rgb) / <alpha-value>)",
        "maroon-deep": "rgb(var(--maroon-deep-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Jost", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { page: "80rem" },
    },
  },
  plugins: [],
};
