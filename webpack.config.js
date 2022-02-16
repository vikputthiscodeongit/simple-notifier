const path = require("path");

module.exports = {
    context: path.resolve(__dirname, "./src"),

    entry: {
        main: "./js/index.js"
    },

    output: {
        filename: "simple-notifier.js"
    },

    stats: {
        children: true
    },

    mode: "production",

    devtool: "source-map",

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};
