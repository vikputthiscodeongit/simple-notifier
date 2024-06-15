/* eslint-disable no-undef */
const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false,
                    useBuiltIns: "usage",
                    corejs: { version: "3.37" },
                },
            ],
            [
                "@babel/preset-typescript",
                {
                    rewriteImportExtensions: true,
                },
            ],
        ],
        parserOpts: { strictMode: true },
    };
};

module.exports = config;
