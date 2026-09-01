const stylelintrc = require.resolve('@box/frontend/stylelint/stylelint.config.js');

module.exports = {
    extends: [stylelintrc],
    rules: {
        'at-rule-no-vendor-prefix': null,
        'declaration-no-important': null,
        'keyframes-name-pattern': null,
        'no-descending-specificity': null,
        'no-duplicate-selectors': null,
        'no-invalid-position-at-import-rule': null,
        'property-no-unknown': null,
        'property-no-vendor-prefix': null,
        'scss/at-extend-no-missing-placeholder': null,
        'scss/at-mixin-pattern': null,
        'scss/dollar-variable-pattern': null,
        'scss/load-no-partial-leading-underscore': null,
        'scss/no-global-function-names': null,
        'selector-class-pattern': '[A-Za-z]+([-_]{1,2}[A-Za-z]+)*(_[A-Za-z]+)*$',
        'selector-no-vendor-prefix': null,
    },
};
