[![Project Status](https://img.shields.io/badge/status-active-brightgreen.svg)](http://opensource.box.com/badges)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/box/box-annotations&style=flat)](https://mergify.io)
[![Styled With Prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![build status](https://travis-ci.com/box/box-annotations.svg?branch=master)](https://travis-ci.com/box/box-annotations)
[![version](https://img.shields.io/badge/version-v4.0.0-beta.9-blue.svg)](https://github.com/box/box-annotations)
[![npm version](https://img.shields.io/npm/v/box-annotations.svg)](https://www.npmjs.com/package/box-annotations)

# [Box Annotations](https://developer.box.com/docs/getting-started-with-new-box-view#section-annotations)

Box Annotations allow developers to provide collaboration capabilities right from within the embedded Box preview in their application. Box Annotations fit a wide range of use cases and can be used to draw the previewer's attention and/or provide feedback on specific parts of a document or images. To learn more about Box Content Preview and for further documentation on how to use it, please go to our page on [Box Content Preview](https://developer.box.com/docs/box-content-preview).

Box Content Preview currently supports four annotation types - highlight comment, highlight only, draw, and point annotation. Box Annotations are today supported on documents and image previews only. You can find the full list of supported file types for Box Content Preview at https://community.box.com/t5/Managing-Your-Content/What-file-types-and-fonts-are-supported-by-Box-s-Content-Preview/ta-p/327#FileTypesSupported.

## Browser Support

- Desktop Chrome, Firefox, Safari, Edge, and Internet Explorer 11
- Mobile support available for iOS Safari, Android Chrome

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
  showAnnotations: true,
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
  boxAnnotations,
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

## Development

- [Dev Setup](docs/dev-setup.md)
- [Contributing](docs/contributing.md)

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
