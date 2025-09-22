import { defineConfig } from "eslint/config";
import eslint from '@eslint/js';
import prettier from "eslint-config-prettier";
import tseslint from 'typescript-eslint';

// global ignores config
// don't add any other keys to this config, otherwise it will stop applying globally
const ignores = {
    ignores: [
        "src-tauri/",
        "dist/",
        "vitest.setup.mjs",
    ],
};

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    prettier,
    ignores,
]);
