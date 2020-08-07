var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'dev'),
    filename: 'app.js'
  }
};