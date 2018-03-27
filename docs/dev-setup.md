Development Setup
-----------------
1. Install Node v8.9.4 or higher.
2. Install yarn package manager `https://yarnpkg.com/en/docs/install`. Alternatively, you can replace any `yarn` command with `npm`.
3. Fork the upstream repo `https://github.com/box/box-annotations`.
4. Clone your fork locally `git clone git@github.com:[YOUR GITHUB USERNAME]/box-annotations.git`.
5. Navigate to the cloned folder `cd box-annotations`
6. Add the upstream repo to your remotes `git remote add upstream git@github.com:box/box-annotations.git`.
7. Verify your remotes are properly set up `git remote -v`. You should pull updates from the Box repo `upstream` and push changes to your fork `origin`.
8. Install dependencies `yarn install`
9. Test your first build! `yarn run build`
10. To test only local annotation changes, see [instantiating a custom instance of Box Annotations](https://github.com/box/box-annotations/#passing-an-instance-of-box-annotations-into-box-content-preview).
11. To link and test your local code changes along with your local Preview changes, run `yarn link` in this repository and `yarn link box-annotations` wherever [Box Content Preview](github.com/box/box-content-preview/) is cloned locally.

While Developing
----------------
Install the following plugins in your preferred editor

* Editor Config (standardizes basic editor configuration)
* ESLint (Javascript linting)
* Prettier & Prettier - ESLint (Automatic Javascript formatting following ESLint config)
* Stylelint (CSS linting)

### Yarn commands

* `yarn run build` to generate resource bundles and JS webpack bundles.
* `yarn run watch` to only generate JS webpack bundles on file changes.
* `yarn run test` launches karma tests with PhantomJS.
* `yarn run test -- --src=PATH/TO/SRC/FILENAME` launches test only for `src/PATH/TO/SRC/__tests__/FILENAME-test.js` instead of all tests. For example, `yarn run test -- --src=doc/DocAnnotator` launches tests for `src/doc/__tests__/DocAnnotator-test.js`. This also works for directories, e.g. `yarn run test -- --src=doc/`.
* `yarn run debug` launches karma tests with PhantomJS for debugging. Open the URL mentioned in the console.
* `yarn run debug -- --src=path/to/src/FILENAME` launches debugging for `src/path/to/src/__tests__/FILENAME-test.js` instead of all tests. Open the URL mentioned in the console.

For more script commands see `package.json`. Test coverage reports are available under reports/coverage.