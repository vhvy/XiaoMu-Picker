const { mergeWithRules, merge } = require("webpack-merge");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mergeRules = {
    module: {
        rules: {
            test: "match",
            use: "prepend"
        }
    },
};

module.exports = merge(mergeWithRules(mergeRules)(common, {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                ]
            }
        ]
    },
}), {
    plugins: [
        new MiniCssExtractPlugin()
    ]
});