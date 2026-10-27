// Karma + Jasmine + webpack + Babel (con instrumentación istanbul para cobertura).
// Ejecutar: npm test   →   reporte HTML en coverage/html/index.html
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
    ],
    // Un solo punto de entrada: src/tests/index.js carga todos los .spec.js(x)
    files: [{ pattern: 'src/tests/index.js', watched: false }],
    preprocessors: { 'src/tests/index.js': ['webpack'] },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { chrome: '100' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ],
                // Instrumenta el código fuente (no las pruebas) para medir cobertura.
                plugins: [['istanbul', { exclude: ['src/tests/', '/.spec.js', '*/.spec.jsx'] }]],
              },
            },
          },
        ],
      },
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
        { type: 'lcovonly', subdir: '.' },
      ],
    },
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox'] },
    },
    client: { jasmine: { random: false } },
    restartOnFileChange: true,
  });
};