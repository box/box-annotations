/* eslint-disable no-unused-expressions */
import * as util from '../../util';
import * as constants from '../../constants';
import DocDrawingDialog from '../DocDrawingDialog';

let dialog;

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  </div>
</div>
<div class="ba-annotation-drawing-dialog"><span class="ba-annotation-drawing-btns">
    <span class="ba-annotation-drawing-label">Yao Ming drew</span>
        <button class="bp-btn-plain ba-btn-annotate-draw-delete">Delete drawing</button>
    </span>
</div>`;

describe('doc/DocDrawingDialog', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        dialog = new DocDrawingDialog({
            annotatedElement: document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT),
            location: {},
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = {
            drawSave: 'save',
            whoDrew: 'someone drew'
        };
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        dialog = null;
    });

    describe('isVisible()', () => {
        it('should return true if the dialog is visible', () => {
            dialog.visible = true;
            expect(dialog.isVisible()).toBeTruthy();
        });

        it('should return false if the dialog is not visible', () => {
            dialog.visible = false;
            expect(dialog.isVisible()).toBeFalsy();
        });
    });

    describe('addAnnotation()', () => {
        it('should setup the element if not already done', () => {
            dialog.element = undefined;
            dialog.setup = jest.fn();
            dialog.assignDrawingLabel = jest.fn();

            dialog.addAnnotation({});
            expect(dialog.setup).toBeCalledWith([{}]);
            expect(dialog.assignDrawingLabel).toBeCalledWith({});

            dialog.element = document.createElement('div');
            dialog.addAnnotation({});
            expect(dialog.setup).toBeCalledWith([{}]);
            expect(dialog.assignDrawingLabel).toBeCalledWith({});
        });
    });

    describe('postDrawing()', () => {
        it('should emit annotation create to indicate that the save button was pressed', () => {
            const event = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn()
            };
            dialog.emit = jest.fn();

            dialog.postDrawing(event);
            expect(dialog.emit).toBeCalledWith('annotationcreate');
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            dialog.commitButtonEl = {
                addEventListener: jest.fn()
            };

            dialog.deleteButtonEl = {
                addEventListener: jest.fn()
            };
        });

        it('should bind touch listeners to buttons', () => {
            dialog.isMobile = true;
            dialog.hasTouch = true;
            dialog.bindDOMListeners();
            expect(dialog.commitButtonEl.addEventListener).not.toBeCalledWith('click', dialog.postDrawing);
            expect(dialog.commitButtonEl.addEventListener).toBeCalledWith('touchend', dialog.postDrawing);
            expect(dialog.deleteButtonEl.addEventListener).not.toBeCalledWith('click', dialog.deleteAnnotation);
            expect(dialog.deleteButtonEl.addEventListener).toBeCalledWith('touchend', dialog.deleteAnnotation);
        });
        it('should bind touch-enabled desktop listeners to buttons', () => {
            dialog.isMobile = false;
            dialog.hasTouch = true;
            dialog.bindDOMListeners();
            expect(dialog.commitButtonEl.addEventListener).toBeCalledWith('click', dialog.postDrawing);
            expect(dialog.commitButtonEl.addEventListener).toBeCalledWith('touchend', dialog.postDrawing);
            expect(dialog.deleteButtonEl.addEventListener).toBeCalledWith('click', dialog.deleteAnnotation);
            expect(dialog.deleteButtonEl.addEventListener).toBeCalledWith('touchend', dialog.deleteAnnotation);
        });
        it('should bind desktop listeners to buttons', () => {
            dialog.isMobile = false;
            dialog.hasTouch = false;
            dialog.bindDOMListeners();
            expect(dialog.commitButtonEl.addEventListener).toBeCalledWith('click', dialog.postDrawing);
            expect(dialog.commitButtonEl.addEventListener).not.toBeCalledWith('touchend', dialog.postDrawing);
            expect(dialog.deleteButtonEl.addEventListener).toBeCalledWith('click', dialog.deleteAnnotation);
            expect(dialog.deleteButtonEl.addEventListener).not.toBeCalledWith('touchend', dialog.deleteAnnotation);
        });
    });

    describe('unbindDOMListeners()', () => {
        it('should unbind listeners on a commit button element', () => {
            dialog.hasTouch = true;
            dialog.commitButtonEl = {
                removeEventListener: jest.fn()
            };

            dialog.unbindDOMListeners();
            expect(dialog.commitButtonEl.removeEventListener).toBeCalledWith('click', dialog.postDrawing);
            expect(dialog.commitButtonEl.removeEventListener).toBeCalledWith('touchend', dialog.postDrawing);
        });

        it('should unbind listeners on a delete button element', () => {
            dialog.hasTouch = true;
            dialog.deleteButtonEl = {
                removeEventListener: jest.fn()
            };

            dialog.unbindDOMListeners();
            expect(dialog.deleteButtonEl.removeEventListener).toBeCalledWith('click', dialog.deleteAnnotation);
            expect(dialog.deleteButtonEl.removeEventListener).toBeCalledWith('touchend', dialog.deleteAnnotation);
        });
    });

    describe('setup()', () => {
        let drawingDialogEl;

        beforeEach(() => {
            drawingDialogEl = document.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_DIALOG);

            dialog.generateDialogEl = jest.fn().mockReturnValue(drawingDialogEl);
            dialog.bindDOMListeners = jest.fn();
            dialog.addAnnotation = jest.fn();
        });

        it('should setup the dialog element without a commit button when given an annotation', () => {
            const annotation = {
                user: {
                    name: 'Yao Ming'
                }
            };
            util.getFirstAnnotation = jest.fn().mockReturnValue(annotation);

            expect(dialog.element).toBeUndefined();
            dialog.setup([annotation]);
            expect(dialog.generateDialogEl).toBeCalled();
            expect(dialog.bindDOMListeners).toBeCalled();
            expect(dialog.addAnnotation).toBeCalled();
            expect(dialog.element.contains(dialog.drawingDialogEl));
            expect(dialog.commitButtonEl).toBeNull;
        });

        it('should setup the dialog element with a commit button when not given an annotation', () => {
            util.getFirstAnnotation = jest.fn();
            dialog.setup();
            expect(dialog.generateDialogEl).toBeCalled();
            expect(dialog.bindDOMListeners).toBeCalled();
            expect(dialog.addAnnotation).not.toBeCalled();
            expect(dialog.element.contains(dialog.drawingDialogEl));
            expect(dialog.commitButtonEl).not.toBeUndefined();
            expect(dialog.element.contains(dialog.commitButtonEl));
        });
    });

    describe('position()', () => {
        it('should insert the element into the page element and set the position', () => {
            const rect = {
                width: 1
            };
            const pageEl = {
                contains: jest.fn().mockReturnValue(false),
                appendChild: jest.fn()
            };

            dialog.location = {
                page: 1
            };
            dialog.annotatedElement = {
                querySelector: jest.fn().mockReturnValue(pageEl)
            };
            dialog.element = {
                style: {
                    left: 0,
                    top: 0
                },
                getBoundingClientRect: jest.fn().mockReturnValue(rect)
            };

            dialog.position(5, 10);
            expect(dialog.element.getBoundingClientRect).toBeCalled();
            expect(pageEl.contains).toBeCalled();
            expect(pageEl.appendChild).toBeCalledWith(dialog.element);
            expect(dialog.annotatedElement.querySelector).toBeCalled();
            expect(dialog.element.style.left).toEqual('4px', '10px');
        });
    });

    describe('hide()', () => {
        it('should hide the element with css', () => {
            dialog.element = {};
            dialog.visible = true;
            util.hideElement = jest.fn();

            dialog.hide();
            expect(util.hideElement).toBeCalledWith(dialog.element);
            expect(dialog.visible).toBeFalsy();
        });
    });

    describe('show()', () => {
        it('should show the element with css', () => {
            const element = 'e';

            util.showElement = jest.fn();
            dialog.element = element;
            expect(dialog.visible).toBeFalsy();

            dialog.show();
            expect(util.showElement).toBeCalledWith(element);
            expect(dialog.visible).toBeTruthy();
        });
    });

    describe('generateDialogEl()', () => {
        let annotation;

        beforeEach(() => {
            annotation = {
                user: {
                    name: 'Yao Ming'
                },
                permissions: {
                    can_delete: true
                }
            };
            util.getFirstAnnotation = jest.fn().mockReturnValue(annotation);
        });

        it('should generate the correctly formatted label dialog element', () => {
            annotation.permissions.can_delete = false;

            const dialogEl = dialog.generateDialogEl([annotation]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).toBeTruthy();
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).not.toBeNull;
        });

        it('should generate without a save button', () => {
            const dialogEl = dialog.generateDialogEl([annotation]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).toBeTruthy();
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).not.toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).not.toBeNull;
        });

        it('should generate a save and delete button', () => {
            util.getFirstAnnotation = jest.fn().mockReturnValue(null);
            const dialogEl = dialog.generateDialogEl([]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).toBeTruthy();
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).not.toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).not.toBeNull;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).not.toBeNull;
        });
    });

    describe('assignDrawingLabel()', () => {
        it('should assign a name to a drawing label', () => {
            const drawingLabelEl = {};
            const notYaoMing = 'not yao ming';
            dialog.drawingDialogEl = {
                querySelector: jest.fn().mockReturnValue(drawingLabelEl)
            };
            util.replacePlaceholders = jest.fn().mockReturnValue(notYaoMing);
            util.showElement = jest.fn();

            dialog.assignDrawingLabel({ user: { id: '1' } });
            expect(drawingLabelEl.textContent).toEqual(notYaoMing);
            expect(dialog.drawingDialogEl.querySelector).toBeCalled();
            expect(util.replacePlaceholders).toBeCalled();
            expect(util.showElement).toBeCalled();
        });

        it('should do nothing when given an invalid annotation or does not have a dialog', () => {
            util.showElement = jest.fn();

            dialog.drawingDialogEl = document.createElement('div');
            dialog.assignDrawingLabel(null);
            dialog.assignDrawingLabel({ user: { id: '0' } });

            dialog.drawingDialogEl = undefined;
            dialog.assignDrawingLabel({ user: { id: '1' } });

            expect(util.showElement).not.toBeCalled();
        });
    });
});
