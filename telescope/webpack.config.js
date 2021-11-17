const path = require('path');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');

// S P E E D
const Webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  externals: [
    nodeExternals({
      modulesDir: './node_modules',
    }),
  ],
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              experimentalWatchApi: true,
              // Disable Type Checking, we'll use ForkTsCheckerWebpackPlugin
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [[
                '@babel/preset-env',
                {
                  targets: {
                    node: '8.10',
                  },
                },
              ]],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    pathinfo: false,
  },
  plugins: [
    new Webpack.IgnorePlugin(/mariasql/, /\/knex\//),
    new Webpack.IgnorePlugin(/mssql/, /\/knex\//),
    new Webpack.IgnorePlugin(/mysql/, /\/knex\//),
    new Webpack.IgnorePlugin(/mysql2/, /\/knex\//),
    new Webpack.IgnorePlugin(/oracle/, /\/knex\//),
    new Webpack.IgnorePlugin(/oracledb/, /\/knex\//),
    new Webpack.IgnorePlugin(/pg-query-stream/, /\/knex\//),
    new Webpack.IgnorePlugin(/sqlite3/, /\/knex\//),
    new Webpack.IgnorePlugin(/strong-oracle/, /\/knex\//),
    new Webpack.IgnorePlugin(/pg-native/, /\/pg\//),
    // Speedy Webpack
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      memoryLimit: 2048,
      workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    }),
    new HardSourceWebpackPlugin(),
  ],
};
