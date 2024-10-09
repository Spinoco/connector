const path = require('path');
module.exports = {
  entry: './output/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dev'),
  },
  resolve: {
    extensions: ['.js']
  }
};
