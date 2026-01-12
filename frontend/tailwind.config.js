/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FFD41D',
        'secondary': '#FFA240',
        'accent': '#D73535',
        'danger': '#FF4646',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#FFD41D",
          "primary-focus": "#FFE066",
          "primary-content": "#1F2937",
          "secondary": "#FFA240",
          "secondary-focus": "#FFB366",
          "secondary-content": "#FFFFFF",
          "accent": "#D73535",
          "accent-focus": "#E04A4A",
          "accent-content": "#FFFFFF",
          "neutral": "#3D4451",
          "neutral-focus": "#2A2E37",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#F5F5F5",
          "base-300": "#E5E5E5",
          "base-content": "#1F2937",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#FFA240",
          "error": "#FF4646",
        },
      },
    ],
  },
}
