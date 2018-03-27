Enabling/Disabling Annotations and Annotation Types
------------
Annotation types can be selectively disabled through preview options. The default enabled types are `point`, `highlight`, and `highlight-comment` for the Document Annotator and `point` for the Image Annotator. Viewer options override global showAnnotations value, for that viewer. See [Box Content Preview](https://github.com/box/box-content-preview) for more details on how to set up the Preview instances that are used with Box Annotations here.
```
// Turn on/off annotations for all viewers
preview.show(..., {
    showAnnotations: Boolean
});
```
Combined with one of the following:
```
// Enable all default annotation types for the specified viewer
preview.show(..., {
    viewers: {
        VIEWER_NAME: {
            annotations: {
                enabled: Boolean, // Enables/disables if set. Respects "showAnnotations" if empty
            }
        }
    }
});

// Enable only certain annotation types are enabled for the specified viewer
preview.show(..., {
    viewers: {
        VIEWER_NAME: {
            annotations: {
                enabledTypes: String[] | null // List of annotation types to enable for this viewer. If empty, will respect default types for that annotator.
            }
        }
    }
});
```
If an instance of BoxAnnotations is being passed into Box Content Preview, annotations options can be specified by viewer.
```
/* global BoxAnnotations */
// Turn on/off all annotation types for each viewer
new BoxAnnotations({
    VIEWER_NAME: {
        enabled: Boolean
    }
});

// Enable/disable the default annotation types for each viewer
new BoxAnnotations({
    VIEWER_NAME: {
        enabled: Boolean, // Enables/disables if set. Respects "showAnnotations" if empty
    }
});

// Enable/disable annotation types for each viewer
new BoxAnnotations({
    VIEWER_NAME: {
        enabledTypes: String[] | null // List of annotation types to enable for this viewer. If empty, will respect default types for that annotator.
    }
});
```

### Examples
Enable all annotations, turn off for Image Viewer, and enable only point annotations on Document Viewer:
```
// Pass options into Preview
preview.show(fileId, token, {
    showAnnotations: true,
    viewers: {
        Image: {
            annotations: {
                enabled: false
            }
        },
        Document: {
            annotations: {
                enabledTypes: ['point']
            }
        }
    }
});
```
Enable the default annotation types for the Document and Image viewers, disable all annotations off for MultiImage Viewer, and enable only highlight comment and drawing annotations on Presentation Viewer:
```
// Instantiate BoxAnnotations with options
const boxAnnotations = new BoxAnnotations({
    MultiImage: {
        enabled: false
    },
    Presentation: {
        enabledTypes: ['highlight-comment', 'draw']
    }
});

preview.show(FILE_ID, ACCESS_TOKEN, {
    container: '.preview-container',
    boxAnnotations
});
```