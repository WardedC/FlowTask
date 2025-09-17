/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class', // Habilita el modo dark con la estrategia de clase
  theme: {
    extend: {
      colors: {
        // FlowTask custom colors
        'ft-night': '#121619',
        'ft-cerulean': '#0075A2',
        'ft-crimson': '#D7263D',
        'ft-lemon-chiffon': '#FAF0CA',
        'ft-baby-powder': '#FCFFFC',
        'ft-violet': '#6A4C93',
        'ft-amber': '#FFB400',
        'ft-turquoise': '#2EC4B6',
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}