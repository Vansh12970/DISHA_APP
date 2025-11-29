/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: "#F5A623",
        orange: "#D35400",
        red: "#A93226",
        teal: "#1C6E7D",
        beige: "#F5E9DA",
        black: "#1B1B1B",
        white: "#FFFFFF",
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
