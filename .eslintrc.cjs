/* eslint-disable no-undef */
const config = {
    env: {
        browser: true,
        es2017: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "@typescript-eslint/no-explicit-any": "warn",
    },
};

module.exports = config;
