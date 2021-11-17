const path = require('path');
const Webpack = require('webpack');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: slsw.lib.entries,
  // mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
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
    plugins: [new TsconfigPathsPlugin({ configFile: "./" })]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'build/dist'),
    filename: '[name].js',
    pathinfo: false,
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
  },
  plugins: [
    // Knex ignores
    new Webpack.IgnorePlugin(/\.\/mariasql$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/mssql$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/mysql2$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/oracle$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/oracledb$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/pg-query-stream$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/sqlite3$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/strong-oracle$/, /\/knex\//),
    new Webpack.IgnorePlugin(/\.\/pg-native$/, /\/pg\//),
    new ForkTsCheckerWebpackPlugin({
      memoryLimit: 2048,
      workers: ForkTsCheckerWebpackPlugin.ONE_CPU,
      checkSyntacticErrors: true
    }),
  ],
};
