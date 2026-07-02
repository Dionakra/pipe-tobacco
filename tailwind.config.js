module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        tobacco: {
          DEFAULT: "#c2703d",
          50: "#fbf5f0",
          100: "#f5e5d8",
          400: "#dc9666",
          500: "#c2703d",
          600: "#a85a2e",
          700: "#8a4926",
        },
        up: "#dc2626",     // price increase - red
        down: "#2563eb",   // price decrease - blue (colorblind friendly)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    }
  },
  plugins: [],
}
