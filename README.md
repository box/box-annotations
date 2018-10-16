[![Project Status](https://img.shields.io/badge/status-active-brightgreen.svg?style=flat-square)](http://opensource.box.com/badges/)
[![Styled With Prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![build status](https://img.shields.io/travis/box/box-content-preview/master.svg?style=flat-square)](https://travis-ci.org/box/box-annotations)
[![version](https://img.shields.io/badge/version-v2.3.0-blue.svg?style=flat-square)](https://github.com/box/box-annotations)
[![npm version](https://img.shields.io/npm/v/box-ui-elements.svg?style=flat-square)](https://www.npmjs.com/package/box-ui-elements)

# [Box Annotations](https://developer.box.com/docs/getting-started-with-new-box-view#section-annotations)

Box Annotations allow developers to provide collaboration capabilities right from within the embedded Box preview in their application. Box Annotations fit a wide range of use cases and can be used to draw the previewer's attention and/or provide feedback on specific parts of a document or images. To learn more about Box Content Preview and for further documentation on how to use it, please go to our page on [Box Content Preview](https://developer.box.com/docs/box-content-preview).

Box Content Preview currently supports four annotation types - highlight comment, highlight only, draw, and point annotation. Box Annotations are today supported on documents and image previews only. You can find the full list of supported file types for Box Content Preview at https://community.box.com/t5/Managing-Your-Content/What-file-types-and-fonts-are-supported-by-Box-s-Content-Preview/ta-p/327#FileTypesSupported.

## Browser Support

*   Desktop Chrome, Firefox, Safari, Edge, and Internet Explorer 11
*   Mobile support available for iOS Safari, Android Chrome

If you are using Internet Explorer 11, which doesn't natively support promises, include a polyfill.io script (see sample code below) or a Promise library like Bluebird.

## Supported Locales

`en-AU`, `en-CA`, `en-GB`, `en-US`, `bn-IN`, `da-DK`, `de-DE`, `es-419`, `es-ES`, `fi-FI`, `fr-CA`, `fr-FR`, `hi-IN`,`it-IT`, `ja-JP`, `ko-KR`, `nb-NO`, `nl-NL`, `pl-PL`, `pt-BR`, `ru-RU`, `sv-SE`, `tr-TR`, `zh-CN`, `zh-TW`

## Usage

Box Annotations can be used by pulling from our [NPM package](https://www.npmjs.com/package/box-annotations).

### Instantiating Box Annotations inside Box Content Preview with default options

```javascript
var preview = new Box.Preview();
preview.show('FILE_ID', 'ACCESS_TOKEN', {
    container: '.preview-container',
    showAnnotations: true
});
```

Where the default enabled types are `point`, `highlight`, and `highlight-comment` for the Document Annotator and `point` for the Image Annotator.

### Passing an instance of Box Annotations into Box Content Preview

```javascript
import BoxAnnotations from 'box-annotations';

/* global BoxAnnotations */
const boxAnnotations = new BoxAnnotations(viewerOptions);

var preview = new Box.Preview();
preview.show(FILE_ID, ACCESS_TOKEN, {
    container: '.preview-container',
    boxAnnotations
});
```

Where `viewerOptions` is an optional object of viewer-specific annotator options and `disabledAnnotationTypes` is an optional string array of valid annotation types to disable. See [Enabling/Disabling Annotations and Annotation Types](docs/enabling-types.md) below for more details on viewer-specific annotation configurations.

## Access Token

Box Annotations needs an access token to make Box API calls. You can either get an access token from the token endpoint (https://developer.box.com/reference#token) or generate a developer token on your application management page (https://blog.box.com/blog/introducing-developer-tokens/).

If your application requires the end user to only be able to access a subset of the Annotations functionality, you can use [Token Exchange](https://developer.box.com/reference#token-exchange) to appropriately downscope your App/Managed or Service Account token to a resulting token that has the desired set of permissions, and can thus, be securely passed to the end user client initializing Annotations.

See [the following documentation](docs/auth.md) for more details on Annotation-specific scopes to go alongside Token Exchange. These allow developers to enable/disable functionality on Box Annotations by configuring the appropriate scopes on the downscoped token. To learn more, see [Special Scopes for Box UI Elements](https://developer.box.com/v2.0/docs/special-scopes-for-box-ui-elements).

## Supported Annotation Types

Point annotations are supported on both document and image formats. Highlight comment, highlight only, and draw annotations are only supported on document formats.

Supported document file extensions: `pdf, doc, docx, ppt, pptx, xls, xlsm, xlsx`

Supported image file extensions: `ai, bmp, dcm, eps, gif, png, ps, psd, svs, tga, tif, tiff`

## Development Setup

1.  Install Node v8.9.4 or higher.
2.  Install yarn package manager `https://yarnpkg.com/en/docs/install`. Alternatively, you can replace any `yarn` command with `npm`.
3.  Fork the upstream repo `https://github.com/box/box-annotations`.
4.  Clone your fork locally `git clone git@github.com:[YOUR GITHUB USERNAME]/box-annotations.git`.
5.  Navigate to the cloned folder `cd box-annotations`
6.  Add the upstream repo to your remotes `git remote add upstream git@github.com:box/box-annotations.git`.
7.  Verify your remotes are properly set up `git remote -v`. You should pull updates from the Box repo `upstream` and push changes to your fork `origin`.
8.  Install dependencies `yarn install`
9.  Test your first build! `yarn run build`
10. To test only local annotation changes, see [instantiating a custom instance of Box Annotations](https://github.com/box/box-annotations/#passing-an-instance-of-box-annotations-into-box-content-preview).
11. To link and test your local code changes along with your local Preview changes, run `yarn link` in this repository and `yarn link box-annotations` wherever [Box Content Preview](github.com/box/box-content-preview/) is cloned locally.

For more information on contributing see [Contributing](docs/contributing.md).

## While Developing

Install the following plugins in your preferred editor

*   Editor Config (standardizes basic editor configuration)
*   ESLint (Javascript linting)
*   Prettier & Prettier - ESLint (Automatic Javascript formatting following ESLint config)
*   Stylelint (CSS linting)

### Yarn commands

*   `yarn run build` to generate resource bundles and JS webpack bundles.
*   `yarn run watch` to only generate JS webpack bundles on file changes.
*   `yarn run test` launches jest.
*   `yarn run test -- --src=PATH/TO/SRC/FILENAME` launches test only for `src/PATH/TO/SRC/__tests__/FILENAME-test.js` instead of all tests. For example, `yarn run test -- --src=doc/DocAnnotator` launches tests for `src/doc/__tests__/DocAnnotator-test.js`. This also works for directories, e.g. `yarn run test -- --src=doc/`.
*   `yarn run debug` launches jest for debugging. Open the URL mentioned in the console.
*   `yarn run debug -- --src=path/to/src/FILENAME` launches debugging for `src/path/to/src/__tests__/FILENAME-test.js` instead of all tests. Open the URL mentioned in the console.

For more script commands see `package.json`. Test coverage reports are available under reports/coverage.

### Config files

*   .babelrc - https://babeljs.io/docs/usage/babelrc/
*   .editorconfig - http://editorconfig.org/
*   .eslintignore - http://eslint.org/docs/user-guide/configuring#ignoring-files-and-directories
*   .eslintrc - http://eslint.org/docs/user-guide/configuring
*   .gitignore - https://git-scm.com/docs/gitignore
*   .stylelintrc - https://stylelint.io/user-guide/configuration/
*   .travis.yml - https://docs.travis-ci.com/user/customizing-the-build
*   browserslist - https://github.com/ai/browserslist
*   commitlint.config.js - https://github.com/marionebl/commitlint
*   postcss.config.js - https://github.com/postcss/postcss-loader

## Support

If you have any questions, please search our [issues list](https://github.com/box/box-annotations/issues) to see if they have been previously answered. Report new issues [here](https://github.com/box/box-annotations/issues/new).

For general Box Platform, API, Elements, and Annotations questions, please visit our [developer forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum) or contact us via one of our [available support channels](https://community.box.com/t5/Community/ct-p/English).

## Copyright and License

Copyright 2016-present Box, Inc. All Rights Reserved.

Licensed under the Box Software License Agreement v.20170516.
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://developer.box.com/docs/box-sdk-license

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
