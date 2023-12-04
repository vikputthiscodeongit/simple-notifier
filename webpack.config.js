import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import CopyPlugin from "copy-webpack-plugin";
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
        filename: "./js/index.js",
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
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
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
    devtool: "eval-cheap-source-map",
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
    devtool: "source-map",
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
                    ecma: "ES2017",
                    module: true,
                    compress: {
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

// eslint-disable-next-line no-undef
const activeConfig = process.env.NODE_ENV === "production" ? prodConfig : devConfig;
const mergedConfig = merge(baseConfig, activeConfig);

export default mergedConfig;
