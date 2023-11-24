/* eslint-disable no-undef */
import path from "path";
import { fileURLToPath } from "url";
// import { merge } from "webpack-merge";
import ESLintPlugin from "eslint-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

// https://stackoverflow.com/a/64383997/6396604
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    context: path.resolve(__dirname),
    mode: "development",
    devtool: "eval-source-map",
    entry: {
        main: "./src/ts/index.ts",
    },
    output: {
        clean: true,
        // chunkFilename: "index-[id].js",
        filename: "./js/index.js",
        // libraryTarget: "umd",
        library: {
            // name: "SimpleNotifier",
            type: "module",
        },
    },
    stats: {
        children: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
        extensionAlias: {
            ".ts": [".ts", ".tsx"],
        },
    },
    plugins: [
        new ESLintPlugin({}),
        new MiniCssExtractPlugin({
            filename: "./styles/simple-notifier.css",
        }),
        new CopyPlugin({
            patterns: [{ from: "src/scss", to: "styles" }],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx|[cm]?js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [["@babel/preset-typescript"], ["@babel/preset-env"]],
                        },
                    },
                ],
            },
            // {
            //     test: /\.js$/,
            //     enforce: "pre",
            //     use: ["source-map-loader"],
            // },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "postcss-loader" },
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                precision: 6,
                            },
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: "ES2017",
                    module: true,
                    mangle: false,
                },
            }),
            new CssMinimizerPlugin(),
        ],
    },
    experiments: {
        outputModule: true,
    },
};

export default config;
