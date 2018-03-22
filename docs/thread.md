Annotation Thread
--------------------

### Methods
The following methods are available for the annotation threads.

| Method Name | Explanation | Method Parameters |
| --- | --- | --- |
| createDialog | Creates the dialog for the thread |  ||
| show | Shows the annotation indicator |  ||
| hide | Hides the annotation indicator |  ||
| reset | Resets thread state to 'inactive' |  ||
| showDialog | Shows the appropriate dialog for this thread |  ||
| hideDialog | Hides the appropriate indicator for this thread |  ||
| saveAnnotation | Saves an annotation locally and on the server | {string} annotation type, {text} text of annotation to save ||
| deleteAnnotation | Deletes an annotation | {string} annotation ID, {boolean} whether or not to delete on server, default true ||

### Events
All annotation threads fire the following events. The event data will contain:
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

| Event Name | Explanation |
| --- | --- |
| annotationpending | An annotation thread was created but has not yet been saved on the server. ||
| annotationthreadsaved | An annotation thread was saved on the server.  ||
| annotationthreaddeleted | An annotation thread was deleted on the server. ||
| annotationsaved | An annotation thread was added and saved to an existing annotation thread on the server  ||
| annotationdeleted | An annotation thread was deleted from an existing thread on the server. The entire annotation thread is not deleted. ||
| annotationcanceled | An annotation thread was cancelled from posting on either a new or existing thread. ||
| annotationdeleteerror | An error occurs while deleting an annotation on either a new or existing thread. ||
| annotationcreateerror | An error occurs while posting an annotation on either a new or existing thread. ||

See [Annotator Events](annotator.md#example-event-usage) for example event usage.