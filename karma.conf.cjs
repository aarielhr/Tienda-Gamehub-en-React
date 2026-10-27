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
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-coverage')
    ],
    files: [
      { pattern: 'src/test/index.js', watched: false },
      { pattern: 'pruebas-karma/**/*.spec.js', watched: false }
    ],
    preprocessors: {
      'src/test/index.js': ['webpack'],
      'pruebas-karma/**/*.spec.js': ['webpack']
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.js', '.jsx']
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { chrome: '100' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }]
                ],
                plugins: [
                  ['istanbul', {
                    exclude: [
                      '**/*.pruebas.js',
                      '**/*.pruebas.jsx',
                      '**/*.spec.js',
                      'src/test/**'
                    ]
                  }]
                ]
              }
            }
          }
        ]
      }
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text' },
        { type: 'text-summary' },
        { type: 'lcovonly', subdir: '.' }
      ]
    },
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    client: {
      jasmine: { random: false }
    },
    restartOnFileChange: true
  });
};