/* eslint-disable no-undef */
const config = {
    env: {
        browser: true,
        es2022: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
};

module.exports = config;
