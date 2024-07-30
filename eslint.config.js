import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        ignores: ["src-tauri/target/"]
    },
    eslintConfigPrettier
];
