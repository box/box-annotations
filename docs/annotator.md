Annotators
-------

Annotators are the communicators between the file itself and the [controller](controller.md). The name of an annotator can be one of the following `DocAnnotator` or `ImageAnnotator`. Call `boxAnnotations.getAnnotators()` to get the list of possible annotators.

Additional Methods
------------------
`annotator.init()` initializes the annotator.

`annotator.isModeAnnotatable(/* String */ type)` returns whether or not the current annotation mode is enabled for the current viewer/annotator.

`annotator.loadAnnotations()` shows saved annotations.

`annotator.setScale()` sets the zoom scale.

`annotator.getLocationFromEvent(/* Event */ event, /* String */ annotationType)` determines the annotation location object from a DOM event.

`annotator.getAnnotatedEl(/* HTMLElement */ containerEl)` determines the DOM element to be annotated on.

`annotator.getAnnotatedEl(/* HTMLElement */ containerEl)` determines the annotated element in the viewer.

`annotator.hideAnnotations(/* Event */ event)` conditionally hides all saved annotations on the file based on an optional mouse event.

`annotator.getCurrentAnnotationMode()` determines which annotation mode is currently active.

`annotator.render()` renders all annotations on the file.

`annotator.renderPage(/* Number */ pageNum)` renders all annotations for the specified page.

`annotator.scrollToAnnotation(/* String */ threadID)` scrolls the annotation with the specified threadID into view.


Events
------
Events can be bound to the annotator object with `addListener` and removed with `removeListener`. Event listeners should be bound before `showAnnotations()` is called, otherwise events can be missed.

```javascript
import BoxAnnotations from 'box-annotations';

const boxAnnotations = new BoxAnnotations();
const annotatorConf = boxAnnotations.determineAnnotator(options, viewerConfig, disabledAnnotationTypes);

// Construct and init annotator
const annotator = new annotatorConf.CONSTRUCTOR(options);
var listener = (value) => {
    // Do something with value
};

// Attach listener before calling show otherwise events can be missed
annotator.addListener(EVENTNAME, listener);

// Initialize a annotator
annotator.showAnnotations();

// Remove listener when appropriate
annotator.removeListener(EVENTNAME, listener);
```

EVENTNAME can be one of the following

* `annotator` event will be fired when we have the annotator instance first available. Box Annotations fires this event before `annotationsfetched` so that clients can attach their listeners before the `annotationsfetched` event is fired from Box Annotations.

* `annotationsfetched` event will be fired when annotations have been fetched from the Box API.

* `annotationerror` event will be fired when an annotation error has occured. The event data will contain:
```javascript
  {
      message: 'message', // Error message to show
  }
```

* `annotatorevent` Each annotator will fire its own sets of events. For example, the Image Annotator will fire `rotate` or `resize`, etc. while other annotator may fire another set of events. The Annotator wrapper will also re-emit events at the Preview level in Box Content Preview, with event data containing:
```javascript
  {
      event: EVENTNAME,             // Event name
      data: DATA,                   // Event data object
      annotatorName: ANNOTATORNAME, // Name of the annotator
      fileVersionId: fileVersionId  // The file version id
      fileId: fileId                // The file id
  }
```

### Example event usage
```javascript
preview.addListener('annotator', (annotator) => {
    annotator.addListener('annotationsfetched', () => {
        // Do something when annotations are fetched on a preview
    });
});

// Event listeners can be attached to viewers
preview.addListener('load', (data) => {
    var viewer = data.viewer;
    viewer.addListener('annotationsfetched', () => {
        // Do something when annotations are fetched on a preview
    });
});

preview.addListener('annotatorevent', (data) => {
    if (data.event === 'annotationsfetched') {
        // Do something when annotations are fetched on a preview
    } else if (data.event === 'annotationerror') {
        // Do something different when an annotation error has occurred
    } else {}
});

preview.addListener('annotatorevent', (data) => {
    if (data.viewerName === 'Image') {
        if (data.event === 'annotationsfetched') {
            // Do something when annotations are fetched on an image preview
        }
    } else if (data.viewerName === 'MultiImage') {
        if (data.event === 'annotationsfetched') {
            // Do something different when annotations are fetched on a multi-page image
        }
    } else {}
});

preview.addListener('annotationsfetched', (data) => {
    if (data.viewerName === 'Image') {
        // Do something when annotations are fetched on an image preview
    } else if (data.viewerName === 'MultiImage') {
        // Do something different when annotations are fetched on a multi-page image
    } else {}
});
```