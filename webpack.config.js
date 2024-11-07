import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

// https://stackoverflow.com/a/64383997/6396604
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
    context: path.resolve(__dirname),
    entry: {
        main: "./src/ts/index.ts",
    },
    output: {
        clean: true,
        filename: "./index.js",
    },
    stats: {
        children: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new ESLintPlugin({
            configType: "flat",
        }),
        new MiniCssExtractPlugin({
            filename: "./simple-notifier.css",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "postcss-loader" },
                ],
            },
        ],
    },
};

const devConfig = {
    mode: "development",
    devtool: "eval-source-map",
    output: {
        library: {
            name: "SimpleNotifier",
            type: "umd",
            export: "default",
        },
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                indentWidth: 4,
                                outputStyle: "expanded",
                                precision: 6,
                            },
                        },
                    },
                ],
            },
        ],
    },
};

const prodConfig = {
    mode: "production",
    devtool: false,
    output: {
        library: {
            type: "module",
        },
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
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
                    ecma: "ES2020",
                    module: true,
                    compress: {
                        drop_console: ["log", "info", "debug"],
                        passes: 2,
                    },
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

const activeConfig = process.env.NODE_ENV === "development" ? devConfig : prodConfig;
const mergedConfig = merge(baseConfig, activeConfig);

export default mergedConfig;
