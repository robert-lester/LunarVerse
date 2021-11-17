const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');

module.exports = {
  devtool: 'source-map',
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  externals: [
    nodeExternals({
      modulesDir: './node_modules',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/preset-env',
            {
              targets: {
                node: '10',
              },
            },
          ]],
        },
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // speed-up compilation and reduce errors reported to webpack
              happyPackMode: true,
              experimentalWatchApi: true,
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'build/dist'),
    filename: '[name].js',
    pathinfo: false,
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.IgnorePlugin(/\.\/mariasql$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/mssql$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/mysql2$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/oracle$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/oracledb$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/pg-query-stream$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/sqlite3$/, /\/knex\//),
    new webpack.IgnorePlugin(/\.\/strong-oracle$/, /\/knex\//),
    new webpack.IgnorePlugin(/pg-native$/, /\/pg\//),
  ],
};
