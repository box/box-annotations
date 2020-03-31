const eslintrc = require.resolve('@box/frontend/eslint/eslintrc.js');

module.exports = {
    extends: [eslintrc],
    rules: {
        camelcase: 0, // fixme
        'class-methods-use-this': 0, // fixme
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['scripts/**/*.js', '**/*-test.[j|t]s*'] }],
        'import/no-unresolved': 'off', // Allows JS files to import TS files
        'prefer-destructuring': ['error', { object: true, array: false }],
        'react/default-props-match-prop-types': 0,
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'flowtype/no-types-missing-file-annotation': 'off',
            },
        },
    ],
};
