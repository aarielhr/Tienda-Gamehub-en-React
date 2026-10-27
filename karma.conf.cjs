
const fs = require('node:fs');

if (process.platform === 'win32' && !process.env.CHROME_BIN) {
  const rutasEdge = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  const navegador = rutasEdge.find(ruta => fs.existsSync(ruta));

  if (navegador) {
    process.env.CHROME_BIN = navegador;
  }
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    files: [
      {
        pattern: 'pruebas-karma/**/*.spec.js',
        watched: false
      }
    ],

    preprocessors: {
      'pruebas-karma/**/*.spec.js': ['webpack']
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',

      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  [
                    '@babel/preset-react',
                    { runtime: 'automatic' }
                  ]
                ]
              }
            }
          }
        ]
      },

      resolve: {
        extensions: ['.js', '.jsx']
      }
    },

    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    autoWatch: false,
    colors: true
  });
};
