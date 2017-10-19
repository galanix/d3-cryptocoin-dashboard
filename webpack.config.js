const path = require("path");
const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
      "bundle": "./src/js/index.js",
      "settings/bundle": "./src/js/settings.js",
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "dest"),
        publicPath: "dest/"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["env"]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        { loader: "css-loader", options: { minimize: true} },
                        { loader: "postcss-loader" },
                        { loader: "sass-loader"}
                    ]
                }),
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        { loader: "css-loader", options: { minimize: true} },
                        { loader: "postcss-loader" },
                        { loader: "sass-loader"}
                    ]
                })
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }           
        ]
    },
    plugins: [
        new ExtractTextPlugin("bundle.min.css"),
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery"
          }),
        new UglifyJSPlugin(),
    ]
}