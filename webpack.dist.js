const path = require('path');
module.exports = {
  entry: './output/index.js',
  mode: 'production',
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
  }
};
