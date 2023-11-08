import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "dist/js/index.js",
    output: {
        file: "dist/js/index.umd.js",
        format: "umd",
        name: "SimpleNotifier",
    },
    plugins: [
        nodeResolve({
            browser: true,
        }),
        commonjs({
            // transformMixedEsModules: true,
        }),
    ],
};
