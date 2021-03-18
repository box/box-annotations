const eslintrc = require.resolve('@box/frontend/eslint/eslintrc.js');

module.exports = {
    extends: [eslintrc],
    rules: {
        'class-methods-use-this': 0, // fixme
        'flowtype/no-types-missing-file-annotation': 'off', // Allows types in TS files
        'import/no-extraneous-dependencies': 'off', // All dependencies are included in dist bundle
        'import/no-unresolved': 'off', // Allows JS files to import TS files
        'import/prefer-default-export': 'off',
        'prefer-destructuring': ['error', { object: true, array: false }],
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
                '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
                '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
            },
        },
        {
            files: ['**/__mocks__/*', '**/__tests__/*'],
            rules: {
                '@typescript-eslint/camelcase': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
        {
            files: ['*.e2e.test.js'],
            rules: {
                'spaced-comment': 'off', // Allow JS files to use TS Triple-Slash Directives
            },
        },
    ],
};
