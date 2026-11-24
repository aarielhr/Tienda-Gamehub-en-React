// Babel solo se usa en las pruebas (Karma + webpack). Vite compila la aplicación con su propio plugin.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { chrome: '120' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  env: {
    test: {
      // Instrumenta el código de src (no las pruebas) para el reporte de cobertura de karma-coverage
      plugins: [['istanbul', { include: ['src/**'], exclude: ['**/*.spec.js', '**/*.spec.jsx', 'src/pruebas/**'] }]],
    },
  },
}
