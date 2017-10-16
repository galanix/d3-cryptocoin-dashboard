const path = require('path');
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
      'bundle': './src/js/index.js',
    },
    output: {
        filename: '[name].min.js',
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
                use: [
                    { loader: 'css-loader', options: { minimize: true} },
                    { loader: 'postcss-loader' },
                    { loader: 'sass-loader'}
                ]
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
        new ExtractTextPlugin("bundle.min.css"),
        new UglifyJSPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('production')
            }
          }),
    ]
};