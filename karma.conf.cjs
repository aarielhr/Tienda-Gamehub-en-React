// Configuración de Karma con webpack y Babel para las pruebas unitarias de EV2 y EV3.
// Usa .cjs porque package.json tiene "type": "module".
const path = require('node:path')
const fs = require('node:fs')
const webpack = require('webpack')

if (process.platform === 'win32' && !process.env.CHROME_BIN) {
  const edge = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p))
  if (edge) process.env.CHROME_BIN = edge
}

// babel.config.cjs instrumenta el código para la cobertura solo cuando BABEL_ENV es "test"
process.env.BABEL_ENV = 'test'

const SRC = path.resolve(__dirname, 'src')

module.exports = function (config) {
  config.set({
    basePath: '',

    // Jasmine aporta describe, it, expect y los espías; webpack arma un paquete con cada prueba
    frameworks: ['jasmine', 'webpack'],

    // Las pruebas viven junto al código: src/**/*.spec.js y src/**/*.spec.jsx
    files: [{ pattern: 'src/**/*.spec.js*', watched: false }],
    preprocessors: { 'src/**/*.spec.js*': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      module: {
        // babel-loader traduce JSX con @babel/preset-react
        rules: [{ test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' }],
      },
      resolve: { extensions: ['.js', '.jsx'] },
      plugins: [
        // src/config.js usa import.meta.env, que es propio de Vite; en las pruebas se reemplaza por un doble
        new webpack.NormalModuleReplacementPlugin(/[\\/]config\.js$/, (recurso) => {
          if (recurso.context.startsWith(SRC)) {
            recurso.request = path.join(SRC, 'pruebas', 'config.prueba.js')
          }
        }),
      ],
    },

    // progress muestra el avance; coverage genera coverage/html y un resumen en la terminal
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        // maxCols evita que los nombres largos se corten con «...» cuando la terminal es angosta
        { type: 'text', subdir: '.', file: 'por-archivo.txt', maxCols: 200 },
      ],
      // Se informa la cobertura para orientar las pruebas sin convertir los módulos de persistencia
      // local de EV2 (que la aplicación integrada ya no importa) en un fallo global de EV3.
    },

    // El navegador se selecciona por CHROME_BIN (Google Chrome o Microsoft Edge en Windows).
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] },
    },
    singleRun: true,
    autoWatch: false,

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: 1,
  })
}
