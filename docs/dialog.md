Annotation Dialog
--------------------

Annotation dialogs maintain the dialog UI corresponding with an [annotation thread](thread.md), displaying the metadata of annotations and buttons to create/update/delete
### Methods
The following methods are available for the annotation dialogs.

| Method Name | Explanation | Method Parameters |
| --- | --- | --- |
| show | Positions and shows the dialog |  ||
| hide | Hides the dialog |  ||
| hideMobileDialog | Hides and resets the shared mobile dialog |  ||
| addAnnotation | Adds an annotation to the dialog | {Annotation} annotation to add ||
| removeAnnotation | Removes an annotation from the dialog | {string} annotation ID ||
| postAnnotation | Posts an annotation in the dialog | {string} annotation text to post ||
| position | Positions the dialog |  ||

See [Annotator Events](annotator.md#example-event-usage) for example event usage.