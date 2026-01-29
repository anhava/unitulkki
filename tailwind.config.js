/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Unitulkki custom colors
        dream: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#a78bfa",
          dark: "#0f0f23",
          darker: "#0a0a1a",
        },
      },
    },
  },
  plugins: [],
};
