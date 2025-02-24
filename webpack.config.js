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
    entry: { main: "./src/ts/index.ts" },
    output: { clean: true, filename: "./index.js", library: { type: "module" } },
    stats: { children: true },
    resolve: { extensions: [".ts", ".js"] },
    plugins: [
        new ESLintPlugin({ configType: "flat" }),
        new MiniCssExtractPlugin({ filename: "./simple-notifier.css" }),
    ],
    module: {
        rules: [
            { test: /\.js$/, enforce: "pre", use: ["source-map-loader"] },
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "postcss-loader" },
                    { loader: "sass-loader" },
                ],
            },
        ],
    },
    experiments: { outputModule: true },
};

const devConfig = {
    mode: "development",
    devtool: "eval-source-map",
};

const prodConfig = {
    mode: "production",
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: "ES2020",
                    module: true,
                    compress: { drop_console: ["log", "info", "debug"], passes: 2 },
                    mangle: false,
                },
            }),
            new CssMinimizerPlugin(),
        ],
    },
};

const activeConfig = process.env.NODE_ENV === "production" ? prodConfig : devConfig;
const mergedConfig = merge(baseConfig, activeConfig);

export default mergedConfig;
