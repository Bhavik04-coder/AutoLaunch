// PostCSS config — Tailwind v4 with Turbopack on Windows
// Uses @tailwindcss/postcss but only for webpack builds.
// Turbopack handles CSS natively and bypasses PostCSS.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
