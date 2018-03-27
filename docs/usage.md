Usage
-----
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
Where `viewerOptions` is an optional object of viewer-specific annotator options and `enabledTypes` is an optional string array of valid annotation types to enable. See [Enabling/Disabling Annotations and Annotation Types](docs/enablingdisabling-annotations-and-annotation-types.md) below for more details on viewer-specific annotation configurations.