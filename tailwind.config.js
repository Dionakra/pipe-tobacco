module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        tobacco: "#de8855"
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    }
  },
  plugins: [],
}
