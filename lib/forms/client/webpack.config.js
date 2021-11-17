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
        test: /\.ts$/,
        loader: 'string-replace-loader',
        options: {
          search: 'STAGE_URL',
          replace: process.env.STAGE,
          flags: 'i',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
