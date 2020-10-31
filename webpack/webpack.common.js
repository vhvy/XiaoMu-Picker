const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


module.exports = {
    entry: "./src/js/picker.js",
    output: {
        path: path.resolve("./", "dist"),
        filename: "picker.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}