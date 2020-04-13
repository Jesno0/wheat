const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: './view/js/main.js',
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '/view/public/',
    filename: 'build.js'
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    inline: true,
    proxy: {
      '/': {
        target: 'http://localhost:3003/',
        changeOrigin: true //启用跨域
      }
    }
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [{loader: 'vue-loader'}]
      },
      {
        test: /\.js$/,
        use: [{loader: 'babel-loader'}]
      },
      {
        test: /\.(png|jpe?g|gif|woff|eot|ttf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'dirname/[contenthash].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  }
};