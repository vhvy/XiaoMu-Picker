const { merge, mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const mergeRules = {
    module: {
        rules: {
            test: "match",
            use: "prepend"
        }
    },
};

module.exports = merge(mergeWithRules(mergeRules)(common, {
    mode: "development",
    entry: "./src/js/test.js",
    devtool: "inline-source-map",
    devServer: {
        compress: true,
        port: 8675,
        host: "0.0.0.0",
        open: true
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                ]
            }
        ]
    },
}), {
    plugins: [
        new HtmlWebpackPlugin({
            title: "PICKER",
            template: path.resolve("./template", "index.html")
        })
    ]
});