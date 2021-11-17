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
      {
        test: /\.ejs$/,
        loader: 'ejs-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.ejs'],
  },
  output: {
    filename: 'builder.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
