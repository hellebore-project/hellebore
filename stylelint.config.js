/** @type {import('stylelint').Config} */
export default {
    extends: [
        "stylelint-config-standard",
        "stylelint-config-tailwindcss",
    ],
    rules: {
        "nesting-selector-no-missing-scoping-root": [
            true,
            {
                "ignoreAtRules": [
                    "custom-variant",
                    "utility",
                ]
            }
        ]
    }
};
