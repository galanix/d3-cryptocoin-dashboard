const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
      'bundle': './src/js/index.js',
      'settings/bundle': './src/js/settings.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dest'),
        publicPath: 'dest/'
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                  presets: [
                    'es2015', 'react'
                  ]
              }
            }
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: ['css-loader','postcss-loader','sass-loader']
            }),
        },
        {       
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: ['css-loader','postcss-loader']
            })
        }
        ]
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
    ]
}