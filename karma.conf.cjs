
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
