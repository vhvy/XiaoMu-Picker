const { mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common");

const mergeRules = {
    module: {
        rules: {
            test: "match",
            use: "prepend"
        }
    },
};

module.exports = mergeWithRules(mergeRules)(common, {
    mode: "production",
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
    optimization: {
        moduleIds: 'deterministic',
    },
});