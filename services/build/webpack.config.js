var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  watch: false,
  output: {
    path: path.resolve(__dirname, 'prod'),
    filename: 'app.js'
  }
};