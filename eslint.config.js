import eslint from '@eslint/js';
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

// global ignores config
// don't add any other keys to this config, otherwise it will stop applying globally
const ignores = {
    ignores: [
        "src-tauri/",
        "dist/",
        "eslint.config.js",
        "vitest.setup.mjs",
    ],
};

const importConfig = {
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    plugins: {
        importPlugin,
    },
    rules: {
        "import/order": ["error", {
            "groups": [
                // Imports of builtins are first
                "builtin",
                "external",
                "internal",
                // Then sibling and parent imports. They can be mingled together
                ["sibling", "parent"],
                // Then index file imports
                "index",
                // Then any arcane TypeScript imports
                "object",
                // Then the omitted imports: internal, external, type, unknown
            ],
            "newlines-between": "always",
        }],
    },
    settings: {
        "import/resolver": {
            typescript: {},
        },
    },
}

const testConfig = {
    files: ["tests/**"],
    rules: {
        "no-empty-pattern": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}

export default defineConfig([
    ignores,
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    importConfig,
    testConfig,
    // the prettier config has to be applied last because
    // it turns off any rules that conflict with prettier
    prettier,
]);
