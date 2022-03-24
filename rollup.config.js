import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";

const isDevelopment = process.env.NODE_ENV === "development";

export default {
    input: "./src/js/index.js",

    output: {
        file: "./dist/js/simple-notifier.bundle.js",
        format: "umd",
        name: "SimpleNotifier",
        sourcemap: isDevelopment ? "inline" : true
    },

    plugins: [
        resolve(),
        commonjs({
            transformMixedEsModules: true
        }),
        babel({
            babelHelpers: "bundled"
        })
    ]
};
