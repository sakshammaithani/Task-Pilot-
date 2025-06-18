// taskpilot-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Example fonts similar to rubioydelamo.com (clean sans-serif)
        // You'll need to link these in public/index.html
        sans: ['Inter', 'sans-serif'], // Primary body and UI font
        heading: ['Playfair Display', 'serif'], // Optional: A more elegant serif for headings
        // If you only want one font, just use 'sans' and remove 'heading'
      },
      colors: {
        // Define a sophisticated, minimalist color palette
        primary: '#1A1A1A',        // Darkest text, primary elements
        secondary: '#4A4A4A',      // Muted text, secondary elements
        tertiary: '#9B9B9B',       // Lightest text for accents or subtle details
        background: '#F5F5F5',     // Light background (almost white)
        surface: '#FFFFFF',        // White for cards, forms, modals
        accent: '#007bff',         // Your existing blue for interactive elements
        'accent-dark': '#0056b3',  // Darker shade for hover states
        border: '#E0E0E0',         // Light grey for subtle borders
        divider: '#CCCCCC',        // Slightly darker grey for dividers
        // Dark mode palette
        'dark-primary': '#E0E0E0',
        'dark-secondary': '#A0A0A0',
        'dark-tertiary': '#606060',
        'dark-background': '#1A1A1A',
        'dark-surface': '#2A2A2A',
        'dark-accent': '#3F8CFF', // A slightly brighter blue for dark mode if needed
        'dark-accent-dark': '#1F6BFF',
        'dark-border': '#3A3A3A',
        'dark-divider': '#4A4A4A',
      }
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode using a class on the html tag
}