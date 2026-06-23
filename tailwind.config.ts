/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      inter: "'Inter', sans-serif",
      zone99: "warzone97",
      origin: "OriginTechDemoRegular",
    },
    container: {
      center: true,
      padding: "1rem",
    },
    // NOTE: colors live under `extend` so Tailwind's default palette (violet-*,
    // indigo-*, red-*, green-*, yellow-*, orange-*, slate-*, …) stays available.
    // These semantic tokens are the "Violet on Slate" design system.
    extend: {
      colors: {
        current: "currentColor",
        transparent: "transparent",
        white: "#FFFFFF",
        black: "#0a0c12",
        error: "#f87171",

        // ── Brand accent (violet) ───────────────────────────────
        primary: {
          DEFAULT: "#6d5efc",
          600: "#5a4af0",
          700: "#4a3ad6",
          glow: "#8b7dff",
        },
        secondary: "#8b7dff", // legacy alias → violet (was emerald)

        // ── Surfaces (neutral cool-slate, no green tint) ────────
        background: "#0d0f17",
        "bg-secondary": "#161925",
        "surface-base": "#0d0f17",
        "surface-panel": "#161925",
        "surface-sunken": "#0b0d14",
        "surface-hover": "#1d2130",
        "surface-accent": "#6d5efc",
        "surface-accentHover": "#5a4af0",

        // ── Borders ─────────────────────────────────────────────
        "border-subtle": "#262a3a",
        "border-strong": "#363b4f",

        // ── Text ────────────────────────────────────────────────
        "text-primary": "#f3f4f8",
        "text-secondary": "#9aa4b6",
        "text-muted": "#6b7280",

        // ── Status ──────────────────────────────────────────────
        "status-success": "#34d399",
        "status-warning": "#fbbf24",
        "status-danger": "#f87171",
        "status-info": "#60a5fa",

        // ── Vault design system (Figma node 1:2) ────────────────
        // Semantic tokens backed by CSS variables in globals.css. Use these for
        // all new/redesigned UI (e.g. bg-vault-surface, text-vault-secondary).
        vault: {
          bg: "var(--vault-bg)",
          surface: "var(--vault-surface)",
          "surface-2": "var(--vault-surface-2)",
          "surface-3": "var(--vault-surface-3)",
          inset: "var(--vault-inset)",
          border: "var(--vault-border)",
          "border-strong": "var(--vault-border-strong)",
          "border-accent": "var(--vault-border-accent)",
          text: "var(--vault-text)",
          "text-secondary": "var(--vault-text-secondary)",
          "text-tertiary": "var(--vault-text-tertiary)",
          "on-accent": "var(--vault-text-on-accent)",
          accent: "var(--vault-accent)",
          violet: "var(--vault-violet)",
          "accent-soft": "var(--vault-accent-soft)",
          success: "var(--vault-success)",
          "success-soft": "var(--vault-success-soft)",
          warning: "var(--vault-warning)",
          "warning-soft": "var(--vault-warning-soft)",
          danger: "var(--vault-danger)",
          "danger-soft": "var(--vault-danger-soft)",
          info: "var(--vault-info)",
        },
      },
      borderRadius: {
        vault: "var(--vault-radius)",
        "vault-sm": "var(--vault-radius-sm)",
        "vault-md": "var(--vault-radius-md)",
        "vault-lg": "var(--vault-radius-lg)",
        "vault-xl": "var(--vault-radius-xl)",
        "vault-2xl": "var(--vault-radius-2xl)",
        "vault-full": "var(--vault-radius-full)",
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing?, fontWeight? }] — Inter, Vault scale.
        "display-xl": ["56px", { lineHeight: "60px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-l": ["44px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["32px", { lineHeight: "38px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "30px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "26px", fontWeight: "600" }],
        title: ["16px", { lineHeight: "22px", fontWeight: "600" }],
        "body-l": ["17px", { lineHeight: "27px" }],
        body: ["15px", { lineHeight: "23px" }],
        "body-strong": ["15px", { lineHeight: "23px", fontWeight: "500" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        caption: ["13px", { lineHeight: "18px" }],
        overline: ["11px", { lineHeight: "14px", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 1.5s infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      boxShadow: {
        primary: "0px 8px 24px -6px rgba(109, 94, 252, 0.45)",
        secondary: "0px 8px 24px -6px rgba(139, 125, 255, 0.40)",
        yellow: "0px 8px 24px -6px rgba(251, 191, 36, 0.40)",
        // ── Vault effects (Figma node 1:2) ──────────────────────
        "vault-card": "var(--vault-shadow-card)",
        "vault-popover": "var(--vault-shadow-popover)",
        "vault-glow": "var(--vault-glow-accent)",
        "vault-glow-success": "var(--vault-glow-success)",
      },
      spacing: {
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
      },
    },
  },
  plugins: [
    require("@shrutibalasa/tailwind-grid-auto-fit"),
    require("tailwindcss-animatecss"),
  ],
};
