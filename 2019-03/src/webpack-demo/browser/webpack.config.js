const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack')
const path = require('path');
module.exports = {
  entry: {
    app: './src/index.js',
    // vendor: ['vue']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.vue$/,
        include: [path.resolve(__dirname, 'src')],
        use:[
          {
            loader: 'vue-loader'  
          }
        ]
      },
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      }
    ] 
  },
  // optimization: {
  //   splitChunks: {
  //     name: true,
  //     chunks: 'all'
  //   }
  // },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
}