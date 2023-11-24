import autoprefixer from "autoprefixer";

const config = () => {
    const baseConfig = {
        plugins: [autoprefixer],
    };

    return baseConfig;
};

export default config;
