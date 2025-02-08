module.exports = {
  mode: 'jit', // Active le mode JIT
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Assurez-vous que les chemins sont corrects
  theme: {
    extend: {},
  },
  plugins: [],
};
