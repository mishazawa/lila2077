const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENTRY_PATH = 'src';
const OUTPUT_PATH = 'build';

module.exports = {
  entry: {
    app: path.resolve(__dirname, ENTRY_PATH, 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, OUTPUT_PATH),
    filename: 'app.bundle.js',
  },
  devtool: process.env.PRODUCTION !== "true" ? 'eval' : 'none',
  watch: process.env.PRODUCTION !== "true",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, ENTRY_PATH),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: 'raw-loader'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, ENTRY_PATH, 'index.html'),
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, ENTRY_PATH, 'index.html'),
        to: path.resolve(__dirname, OUTPUT_PATH),
      }
    ]),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, OUTPUT_PATH),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        },
      },
    },
  },
}
