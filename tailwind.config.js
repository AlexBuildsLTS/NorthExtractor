// FILE: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: Ensure these paths match your actual folder structure
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
        }
      }
    },
  },
  plugins: [],
}