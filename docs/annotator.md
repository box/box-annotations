Annotators
-------
The name of an annotator can be one of the following `DocAnnotator` or `ImageAnnotator`. Call `boxAnnotations.getAnnotators()` to get the list of possible annotators.

Additional Methods
------------------
`annotator.init()` initializes the annotator.

`annotator.isModeAnnotatable(/* String */ type)` returns whether or not the current annotation mode is enabled for the current viewer/annotator.

`annotator.showModeAnnotateButton(/* String */ currentMode)` shows the annotate button for the specified annotation mode.

`annotator.getAnnotateButton(/* String */ annotatorSelector)` gets the annotation button element.

`annotator.showAnnotations()` fetches and shows saved annotations.

`annotator.hideAnnotations()` hides annotations.

`annotator.hideAnnotationsOnPage(/* number */ pageNum)` hides annotations on a specified page.

`annotator.setScale()` sets the zoom scale.

`annotator.toggleAnnotationHandler()` toggles annotation modes on and off. When an annotation mode is on, annotation threads will be created at that location.

`annotator.disableAnnotationMode(/* String */ mode, /* HTMLElement */ buttonEl)` disables the specified annotation mode.

`annotator.enableAnnotationMode(/* String */ mode, /* HTMLElement */ buttonEl)` enables the specified annotation mode.

`annotator.getAnnotatedEl(/* HTMLElement */ containerEl)` determines the annotated element in the viewer.

`annotator.createAnnotationThread(/* Annotation[] */ annotations, /* Object */ location, /* String */ [annotation type])` creates the proper type of annotation thread, adds it to the in-memory map, and returns it.

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

* `annotator` event will be fired when we have the annotator instance first available. Box Annotations fires this event before `load` so that clients can attach their listeners before the `load` event is fired from Box Content Preview.

* `annotationsfetched` event will be fired when annotations have been fetched from the Box API.

* `annotationmodeenter` event will be fired on when an annotation mode is entered. The event data will contain:
```javascript
  {
      mode: 'point', // Annotation mode that was entered
      headerSelector: '.bp-preview-header', // Optional CSS selector for the container's header
  }
```

* `annotationmodeexit` event will be fired on when an annotation mode is exited. The event data will contain:
```javascript
  {
      mode: 'point', // Annotation mode that was exited
      headerSelector: '.bp-preview-header', // Optional CSS selector for the container's header
  }
```

* `annotationerror` event will be fired when an annotation error has occured. The event data will contain:
```javascript
  {
      message: 'message', // Error message to show
  }
```

* `annotationpending` event will be fired when an annotation thread was created but has not yet been saved on the server. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationthreadsaved` event will be fired when an annotation thread was saved on the server. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationthreaddeleted` event will be fired when an annotation thread was deleted on the server. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationsaved` event will be fired when an annotation is added and saved to an existing annotation thread on the server. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationdeleted` event will be fired when an annotation is deleted from an existing thread on the server. The entire annotation thread is not deleted. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationcanceled` event will be fired when an annotation is cancelled from posting on either a new or existing thread. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationdeleteerror` event will be fired when an error occurs while deleting an annotation on either a new or existing thread. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
  }
```

* `annotationcreateerror` event will be fired when an error occurs while posting an annotation on either a new or existing thread. The event data will contain:
```javascript
  {
      data: {
          type: 'point', // Annotation type
          threadID: '123abc',
          userId: '456def',
          threadNumber: '1' // Thread number from Annotations API
      }
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
preview.addListener('annotator', (viewer) => {
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

// Event listeners can be attached to annotators
preview.addListener('load', (data) => {
    var annotator = data.viewer.annotator;
    annotator.addListener('annotationsfetched', () => {
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