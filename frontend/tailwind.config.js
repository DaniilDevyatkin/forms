/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [{ pattern: /^(hover:)?border-(seam|ember-hot)$/ }],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ember: "var(--ember)",
        "ember-hot": "var(--ember-hot)",
        accent: "var(--accent)",
        ok: "var(--ok)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI Variable Display"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ['"SF Mono"', "ui-monospace", "Consolas", "monospace"],
      },
      borderRadius: { md: "10px", lg: "14px", xl: "18px" },
      opacity: { 4: "0.04", 5: "0.05", 6: "0.06", 7: "0.07", 8: "0.08", 12: "0.12", 15: "0.15", 25: "0.25", 30: "0.30", 40: "0.40", 50: "0.50", 60: "0.60", 70: "0.70", 80: "0.80" },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "none" } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: {
        rise: "rise 380ms cubic-bezier(0.25, 1, 0.5, 1) both",
        fade: "fade 260ms ease-out both",
      },
    },
  },
  plugins: [],
};
