/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "luke-dark": "#121212",
        "luke-card": "#1E1E1E",
        "luke-gold": "#D4AF37",
        "luke-gold-light": "#EAC968",
      },
      // Adicionando as Fontes
      fontFamily: {
        sans: ["Montserrat", "sans-serif"], // Fonte padrão para textos
        serif: ["Playfair Display", "serif"], // Fonte elegante para títulos
      },
    },
  },
  plugins: [],
};
