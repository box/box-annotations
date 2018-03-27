Controllers
-------

This class is the communicator between the [Annotator](https://github.com/box/box-annotations/blob/master/src/Annotator.js) and the [Annotation threads](https://github.com/box/box-annotations/blob/master/src/AnnotationThread.js). Each controller maintains an object of pages which contains a [red/black tree](https://github.com/mourner/rbush) unless otherwise specified.

Additional Methods
------------------
`controller.init()` initializes the mode controller.

`controller.getButton(/* String */ controllerSelector)` returns the annotation button element specified by the class selector.

`controller.showButton()` shows the annotate button for the specified annotation mode.

`controller.toggleMode()` toggles annotation modes on and off. When an annotation mode is on, annotation threads will be created at that location.

`controller.exit()` disables the annotation mode.

`controller.enter()` enables the annotation mode.

`controller.isEnabled()` returns whether or not the current annotation mode is enabled.

`controller.registerThread()` register a thread with the controller so that the controller can keep track of relevant threads.

`controller.unregisterThread()` unregister a previously registered thread.

Events
------
All annotation mode conrollers fire the following events. The event data will contain:
```javascript
  {
      event: EVENTNAME,             // Event name
      data: DATA,                   // Event data object
      mode: ANNOTATION_MODE         // Controller's annotation mode
  }
```

| Event Name | Explanation |
| --- | --- |
| togglemode | An annotation mode is toggled on/off. ||
| annotationmodeenter | An annotation mode was entered.  ||
| annotationmodeexit | An annotation mode was exited. ||

See [Annotator Events](annotator.md#example-event-usage) for example event usage.