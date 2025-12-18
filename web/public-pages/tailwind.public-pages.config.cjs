const path = require('path')

module.exports = {
  content: [path.join(__dirname, '*.html'), path.join(__dirname, 'assets/**/*.js')],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#F2F0E9',
        'brand-dark': '#1F2F22',
        'brand-gray': '#8A8A8A',
        'brand-card': '#EAE8E1'
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif']
      },
      spacing: {
        128: '32rem'
      }
    }
  },
  plugins: []
}
