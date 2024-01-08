/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        "coffee-bg": "#FDF7E4",
        "coffee-border": "#65451F",
        "coffee-card": "#DED0B6",
        "coffee-card-hover": "#FAEED1",
        "coffee-card-active": "#BBAB8C",
      }
    },
  },
  plugins: [],
}

