import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "src/ts/index.ts",
    output: {
        file: "dist/js/simple-notifier.umd.js",
        format: "umd",
        name: "SimpleNotifier",
    },
    plugins: [
        nodeResolve(),
        commonjs({
            transformMixedEsModules: true
        })
    ]
};
