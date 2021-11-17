const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './index.ts'),
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'conditionals.js',
    libraryTarget: 'var',
    library: 'Conditionals',
    path: path.resolve(__dirname, '../dist'),
  },
};
