var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  watch: false,
  output: {
    path: path.resolve(__dirname, 'prod'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ]
  }
};