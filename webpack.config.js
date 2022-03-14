const path = require("path");
const { merge } = require("webpack-merge");

const baseConfig = {
    context: path.resolve(__dirname, "./src/js"),

    entry: {
        main: "./index.js"
    },

    output: {
        path: path.resolve(__dirname, "./dist/js"),
        filename: "simple-notifier.js"
    },

    stats: {
        children: true
    },

    module: {
        rules: [
            {
                test: /\.m?js$/i,
                exclude: /(node_modules|bower_components)/
            }
        ]
    }
}

const devConfig = {
    mode: "development",

    devtool: "eval-source-map",

    module: {
        rules: [
            {
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
}

const prodConfig = {
    mode: "production",

    output: {
        clean: true
    },

    devtool: "source-map",

    module: {
        rules: [
            {
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["babel-plugin-transform-remove-console"]
                    }
                }
            }
        ]
    }
}

module.exports = (env, args) => {
    switch(args.mode) {
        case "development":
            return merge(baseConfig, devConfig);
        case "production":
            return merge(baseConfig, prodConfig);
        default:
            throw new Error("No matching configuration was found!");
    }
};
