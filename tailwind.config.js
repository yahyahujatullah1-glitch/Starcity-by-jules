/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark Theme Palette
        background: "#09090b", // Zinc 950
        surface: "#18181b",    // Zinc 900
        border: "#27272a",     // Zinc 800
        
        // Brand Color (Orange)
        primary: {
          DEFAULT: "#f97316",  // Orange 500
          hover: "#ea580c",    // Orange 600
          glow: "rgba(249, 115, 22, 0.2)"
        }
      }
    },
  },
  plugins: [],
}
