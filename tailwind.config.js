/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        campus: {
          lavender: "#F6F5FF",
          indigo: "#4F46E5",
          violet: "#7C3AED",
          coral: "#FF6B6B",
          amber: "#FFB020",
          mint: "#2DD4A7",
          navy: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        "card-lg": "20px",
        button: "12px",
      },
      boxShadow: {
        card:
          "0 4px 6px -1px rgba(79, 70, 229, 0.08), 0 2px 4px -1px rgba(79, 70, 229, 0.04)",
        "card-hover":
          "0 20px 25px -5px rgba(79, 70, 229, 0.12), 0 10px 10px -5px rgba(79, 70, 229, 0.06)",
        glow: "0 0 20px rgba(79, 70, 229, 0.35)",
      },
      animation: {
        "bounce-glow": "bounce-glow 0.6s ease-in-out infinite",
        shake: "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        float: "float 6s ease-in-out infinite",
        "count-up": "count-up 0.6s ease-out forwards",
      },
      keyframes: {
        "bounce-glow": {
          "0%, 100%": {
            transform: "translateY(0)",
            boxShadow: "0 0 0 0 rgba(79, 70, 229, 0.4)",
          },
          "50%": {
            transform: "translateY(-4px)",
            boxShadow: "0 0 0 10px rgba(79, 70, 229, 0)",
          },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-2px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(4px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-6px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(6px, 0, 0)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "count-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

