const config = {
    plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-svelte"],
    overrides: [
        {
            files: "*.svelte",
            options: { parser: "svelte" }
        }
    ],
    tailwindStylesheet: "./src/global.css",
    trailingComma: "all",
    useTabs: false,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    quoteProps: "as-needed",
};

export default config;
