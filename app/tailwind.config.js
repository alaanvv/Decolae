export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        decolae: {
          50: '#f0f7ff', 100: '#e0effe', 500: '#0284c7', 600: '#0369a1',
          700: '#075985', 800: '#0c4a6e', 900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
