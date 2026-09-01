const stylelintrc = require.resolve('@box/frontend/stylelint/stylelint.config.js');

module.exports = {
    extends: [stylelintrc],
    rules: {
        'no-descending-specificity': null,
        'declaration-no-important': null,
        'property-no-vendor-prefix': null,
        'no-duplicate-selectors': null,
        'selector-no-vendor-prefix': null,
        'property-no-unknown': null,
        'at-rule-no-vendor-prefix': null,
        'selector-class-pattern': '[A-Za-z]+([-_]{1,2}[A-Za-z]+)*(_[A-Za-z]+)*$',
        'scss/dollar-variable-pattern': null,
        'scss/at-mixin-pattern': null,
        'scss/no-global-function-names': null,
        'keyframes-name-pattern': null,
        'scss/at-extend-no-missing-placeholder': null,
        'no-invalid-position-at-import-rule': null,
        'scss/load-no-partial-leading-underscore': null,
    },
};
