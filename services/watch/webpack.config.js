var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'dev'),
    filename: 'app.js'
  },
  devtool: 'inline-source-map',
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
    ],
  }
};