const path = require("path");
const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: path.resolve(__dirname, "./src"),

    entry: {
        main: "./js/index.js"
    },

    output: {
        assetModuleFilename: "[path][name]_[contenthash][ext]",
        clean: true,
        chunkFilename: "./js/bundle-[name]-[id].js",
        filename: "./js/bundle-[name].js"
    },

    stats: {
        children: true
    },

    mode: "development",

    devtool: "eval",

    plugins: [
        new MiniCssExtractPlugin({
            filename: "./css/style.css"
        })
    ],

    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                indentWidth: 4,
                                outputStyle: "expanded",
                                precision: 6
                            }
                        }
                    }
                ]
            }
        ]
    }
};
