/* eslint-disable no-unused-expressions */
import DocHighlightDialog from '../DocHighlightDialog';
import Annotation from '../../Annotation';
import AnnotationDialog from '../../AnnotationDialog';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import * as constants from '../../constants';

let dialog;

const DATA_TYPE_HIGHLIGHT_BTN = 'highlight-btn';
const DATA_TYPE_ADD_HIGHLIGHT_COMMENT = 'add-highlight-comment-btn';
const PAGE_PADDING_TOP = 15;

const html = `<div class="annotated-element">
<div data-page-number="1"></div>
<div data-type="annotation-dialog" class="ba-annotation-dialog">
  <div class="ba-annotation-caret"></div>
  <div class="ba-annotation-highlight-dialog">
    <span class="ba-annotation-highlight-label"></span>
  </div>
  <div class="annotation-container">
    <div data-section="create"></div>
    <div data-section="show"></div>
  </div>
</div>
</div>
`;

const mobileHeader = '<div class="ba-annotation-mobile-header"></div>';

describe('doc/DocHighlightDialog', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        dialog = new DocHighlightDialog({
            annotatedElement: document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT),
            location: {
                page: 1
            },
            annotations: [],
            canAnnotate: true,
            locale: 'en-US'
        });
        dialog.localized = {
            highlightToggle: 'highlight toggle',
            whoHighlighted: '{1} highlighted'
        };
        dialog.setup();
        document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT).appendChild(dialog.element);

        dialog.emit = jest.fn();
    });

    afterEach(() => {
        const dialogEl = document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT);
        dialogEl.parentNode.removeChild(dialogEl);
        document.body.removeChild(rootElement);
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }
    });

    describe('show()', () => {
        beforeEach(() => {
            dialog.hasAnnotations = jest.fn().mockReturnValue(true);
            dialog.position = jest.fn();
            util.replacePlaceholders = jest.fn();
            util.showElement = jest.fn();
            dialog.emit = jest.fn();

            const labelEl = document.createElement('div');
            labelEl.classList.add(constants.CLASS_HIGHLIGHT_LABEL);
            dialog.highlightDialogEl = document.createElement('div');
            dialog.highlightDialogEl.appendChild(labelEl);
        });

        it('should do nothing if dialog has no annotations', () => {
            dialog.hasAnnotations = jest.fn().mockReturnValue(false);
            dialog.show([]);
            expect(dialog.emit).not.toBeCalledWith('annotationshow');
        });

        it('should display who highlighted the text for plain highlights', () => {
            const annotation = {
                user: {
                    id: 1,
                    name: 'Sumedha Pramod'
                },
                text: ''
            };
            dialog.show([annotation]);
            expect(dialog.emit).toBeCalledWith('annotationshow');
            expect(util.replacePlaceholders).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.position).toBeCalled();
        });

        it('should not position plain highlights on mobile devices', () => {
            const annotation = {
                user: {
                    id: 1,
                    name: 'Sumedha Pramod'
                },
                text: ''
            };
            dialog.isMobile = true;
            dialog.showMobileDialog = jest.fn();

            dialog.show([annotation]);
            expect(dialog.emit).toBeCalledWith('annotationshow');
            expect(util.replacePlaceholders).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.position).not.toBeCalled();
        });
    });

    describe('postAnnotation()', () => {
        const postFunc = AnnotationDialog.prototype.postAnnotation;

        beforeEach(() => {
            Object.defineProperty(AnnotationDialog.prototype, 'postAnnotation', { value: jest.fn() });
            dialog.destroy = jest.fn();
            util.showElement = jest.fn();
        });

        afterEach(() => {
            Object.defineProperty(AnnotationDialog.prototype, 'postAnnotation', { value: postFunc });
        });

        it('should do nothing if not text is present', () => {
            dialog.postAnnotation(' ');
            expect(AnnotationDialog.prototype.postAnnotation).not.toBeCalled();
        });

        it('should not modify mobile ui there is no mobile header present', () => {
            dialog.postAnnotation('This is the water and this is the well.');
            expect(util.showElement).not.toBeCalledWith(constants.CLASS_MOBILE_DIALOG_HEADER);
        });

        it('should show the mobile header and remove the plain highlight class from the dialog', () => {
            dialog.isMobile = true;
            dialog.element.innerHTML = mobileHeader;
            dialog.postAnnotation('Drink full and descend.');
            expect(util.showElement).toBeCalledWith(constants.CLASS_MOBILE_DIALOG_HEADER);
            expect(dialog.element.classList.contains(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT)).toBeFalsy();
        });
    });

    describe('hideCommentsDialog()', () => {
        it('should do nothing if the comment dialog is already hidden', () => {
            dialog.highlightDialogEl = {};
            dialog.commentsDialogEl = document.createElement('div');
            dialog.commentsDialogEl.classList.add(constants.CLASS_HIDDEN);
            dialog.hideCommentsDialog();
            expect(dialog.element.classList.contains(constants.CLASS_HIDDEN)).toBeTruthy();
        });

        it('should hide the comment dialog', () => {
            dialog.highlightDialogEl = {
                classList: {
                    remove: jest.fn()
                }
            };
            dialog.hideCommentsDialog();

            expect(dialog.commentsDialogEl.classList.contains(constants.CLASS_HIDDEN)).toBeTruthy();
        });

        it('should add Highlight Dialog class to the dialog.element', () => {
            dialog.commentsDialogEl.classList.remove(constants.CLASS_HIDDEN);
            dialog.highlightDialogEl = {
                classList: {
                    remove: jest.fn()
                }
            };
            dialog.hideCommentsDialog();

            expect(dialog.element.classList.contains(constants.CLASS_HIGHLIGHT_DIALOG)).toBeTruthy();
        });

        it('should show the highlight dialog', () => {
            dialog.commentsDialogEl.classList.remove(constants.CLASS_HIDDEN);
            dialog.hideCommentsDialog();

            expect(dialog.highlightDialogEl.classList.contains(constants.CLASS_HIDDEN)).toBeFalsy();
        });
    });

    describe('position()', () => {
        beforeEach(() => {
            dialog.getScaledPDFCoordinates = jest.fn().mockReturnValue([150, 2]);
            util.getDialogWidth = jest.fn();
            util.repositionCaret = jest.fn();
            util.showElement = jest.fn();
            dialog.fitDialogHeightInPage = jest.fn();
        });

        it('should position the plain highlight dialog at the right place and show it', () => {
            dialog.hasComments = false;
            util.getDialogWidth = jest.fn().mockReturnValue(100);
            util.repositionCaret = jest.fn().mockReturnValue(10);

            dialog.position();

            expect(dialog.getScaledPDFCoordinates).toBeCalled();
            expect(util.getDialogWidth).toBeCalled();
            expect(util.repositionCaret).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.element.style.left).toEqual('10px');
        });

        it('should position the highlight comments dialog at the right place and show it', () => {
            dialog.hasComments = true;
            util.repositionCaret = jest.fn().mockReturnValue(10);

            dialog.position();

            expect(dialog.getScaledPDFCoordinates).toBeCalled();
            expect(util.getDialogWidth).toBeCalled();
            expect(util.repositionCaret).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.element.style.left).toEqual('10px');
        });

        it('should adjust the dialog if the mouse location is above the page', () => {
            dialog.hasComments = false;
            dialog.getScaledPDFCoordinates = jest.fn().mockReturnValue([150, -1]);

            dialog.position();

            expect(dialog.getScaledPDFCoordinates).toBeCalled();
            expect(dialog.element.style.top).toEqual(`${PAGE_PADDING_TOP}px`);
        });

        it('should adjust the dialog if the dialog will run below the page', () => {
            dialog.hasComments = false;

            dialog.position();

            expect(dialog.getScaledPDFCoordinates).toBeCalled();
            expect(dialog.element.style.top).toEqual(`${PAGE_PADDING_TOP}px`);
        });
    });

    describe('toggleHighlightDialogs()', () => {
        beforeEach(() => {
            dialog.position = jest.fn();
            util.showElement = jest.fn();
            util.hideElement = jest.fn();
        });

        it('should display comments dialog on toggle when comments dialog is currently hidden', () => {
            const commentsDialogEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_CONTAINER);
            commentsDialogEl.classList.add(constants.CLASS_HIDDEN);

            dialog.toggleHighlightDialogs();

            expect(util.hideElement).toBeCalledWith(dialog.highlightDialogEl);
            expect(util.showElement).toBeCalledWith(dialog.commentsDialogEl);
            expect(dialog.position).toBeCalled();
        });

        it('should display highlight buttons dialog on toggle when comments dialog is currently shown', () => {
            const commentsDialogEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_CONTAINER);
            commentsDialogEl.classList.remove(constants.CLASS_HIDDEN);

            dialog.toggleHighlightDialogs();

            expect(util.hideElement).toBeCalledWith(dialog.commentsDialogEl);
            expect(util.showElement).toBeCalledWith(dialog.highlightDialogEl);
            expect(dialog.position).toBeCalled();
        });
    });

    describe('toggleHighlightCommentsReply()', () => {
        beforeEach(() => {
            dialog.position = jest.fn();
            util.showElement = jest.fn();
            util.hideElement = jest.fn();
        });

        it('should display "Reply" text area in dialog when multiple comments exist', () => {
            const replyTextEl = dialog.commentsDialogEl.querySelector(constants.SECTION_CREATE);
            const commentTextEl = dialog.commentsDialogEl.querySelector(constants.SECTION_SHOW);

            dialog.toggleHighlightCommentsReply(true);
            expect(util.showElement).toBeCalledWith(commentTextEl);
            expect(util.hideElement).toBeCalledWith(replyTextEl);
        });

        it('should display "Add a comment here" text area in dialog when no comments exist', () => {
            const replyTextEl = dialog.commentsDialogEl.querySelector(constants.SECTION_CREATE);
            const commentTextEl = dialog.commentsDialogEl.querySelector(constants.SECTION_SHOW);

            dialog.toggleHighlightCommentsReply(false);
            expect(util.showElement).toBeCalledWith(replyTextEl);
            expect(util.hideElement).toBeCalledWith(commentTextEl);
        });

        it('should reposition the dialog if using a desktop browser', () => {
            dialog.toggleHighlightCommentsReply();
            expect(dialog.position).toBeCalled();
        });

        it('should not reposition the dialog on a mobile device', () => {
            dialog.isMobile = true;
            dialog.toggleHighlightCommentsReply();
            expect(dialog.position).not.toBeCalled();
        });
    });

    describe('setup()', () => {
        let annotation;

        beforeEach(() => {
            annotation = new Annotation({
                text: 'blargh',
                user: { id: 1, name: 'Bob' },
                permissions: {
                    can_delete: true
                },
                threadNumber: 1
            });

            util.showElement = jest.fn();
            util.hideElement = jest.fn();
            dialog.show = jest.fn();
        });

        it('should create a dialog element if it does not already exist', () => {
            dialog.element = null;
            dialog.setup([], false);
            expect(dialog.element).not.toBeNull();
            expect(dialog.element.classList.contains(constants.CLASS_HIDDEN)).toBeTruthy();
        });

        it('should set hasComments according to the number of annotations in the thread', () => {
            dialog.hasComments = null;
            dialog.setup([annotation]);
            expect(dialog.hasComments).toBeTruthy();

            dialog.hasComments = null;
            annotation.text = '';
            dialog.setup([annotation], false);
            expect(dialog.hasComments).toBeFalsy();
        });

        it('should hide the highlight dialog if thread has comments', () => {
            dialog.hasComments = true;
            dialog.setup([annotation]);
            expect(dialog.highlightDialogEl.classList.contains(constants.CLASS_HIDDEN)).toBeTruthy();
        });

        it('should hide the comments dialog if thread does not have comments', () => {
            dialog.hasComments = false;
            annotation = new Annotation({
                text: '',
                user: { id: 1, name: 'Bob' },
                permissions: {
                    can_delete: true
                },
                threadNumber: 1
            });

            dialog.setup([annotation], false);
            expect(dialog.commentsDialogEl.classList.contains(constants.CLASS_HIDDEN)).toBeTruthy();
        });

        it('should setup the dialog element and add thread number to the dialog', () => {
            dialog.setup([annotation]);
            expect(dialog.element.dataset.threadNumber).toEqual('1');
        });

        it('should not set the thread number when using a mobile browser', () => {
            dialog.isMobile = true;
            dialog.setup([annotation], false);
            expect(dialog.element.dataset.threadNumber).toBeUndefined();
        });

        it('should add the text highlighted class if thread has multiple annotations', () => {
            dialog.setup([annotation], false);
            expect(dialog.dialogEl.classList.contains(constants.CLASS_TEXT_HIGHLIGHTED)).toBeTruthy();
        });

        it('should setup and show plain highlight dialog', () => {
            util.isPlainHighlight = jest.fn().mockReturnValue(true);
            dialog.setup([annotation], false);
            expect(util.showElement).toBeCalled();
        });

        it('should add annotation elements', () => {
            dialog.show = jest.fn();
            dialog.setup([annotation, annotation], false);
            expect(dialog.show).toBeCalled();
        });

        it('should bind DOM listeners', () => {
            dialog.bindDOMListeners = jest.fn();
            dialog.setup([annotation], false);
            expect(dialog.bindDOMListeners).toBeCalled();
        });

        it('should not bind DOM listeners if using a mobile browser', () => {
            dialog.bindDOMListeners = jest.fn();
            dialog.isMobile = true;
            dialog.setup([annotation], false);
            expect(dialog.bindDOMListeners).not.toBeCalled();
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            dialog.element = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
        });

        it('should bind DOM listeners', () => {
            dialog.bindDOMListeners();
            expect(dialog.element.addEventListener).toBeCalledWith('mousedown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('wheel', expect.any(Function));
        });

        it('should not bind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;

            dialog.bindDOMListeners();
            expect(dialog.element.addEventListener).toBeCalledWith('mousedown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('wheel', expect.any(Function));
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            dialog.element = {
                removeEventListener: jest.fn()
            };
        });

        it('should unbind DOM listeners', () => {
            dialog.unbindDOMListeners();
            expect(dialog.element.removeEventListener).toBeCalledWith('mousedown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('wheel', expect.any(Function));
        });

        it('should not unbind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;

            dialog.unbindDOMListeners();
            expect(dialog.element.removeEventListener).toBeCalledWith('mousedown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('wheel', expect.any(Function));
        });
    });

    describe('keydownHandler()', () => {
        const event = {
            stopPropagation: jest.fn()
        };

        it('should call mousedownHandler if \'Enter\' is pressed', () => {
            util.decodeKeydown = jest.fn().mockReturnValue('Enter');
            dialog.mousedownHandler = jest.fn();
            dialog.keydownHandler(event);
            expect(dialog.mousedownHandler).toBeCalled();
        });

        it('should not call mousedownHandler if a key other than \'Enter\' is pressed', () => {
            util.decodeKeydown = jest.fn().mockReturnValue('Delete');
            dialog.mousedownHandler = jest.fn();
            dialog.keydownHandler(event);
            expect(dialog.mousedownHandler).not.toBeCalled();
        });
    });

    describe('mousedownHandler()', () => {
        const event = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };

        beforeEach(() => {
            util.findClosestDataType = jest.fn();
            dialog.toggleHighlight = jest.fn();
            dialog.toggleHighlightCommentsReply = jest.fn();
            dialog.toggleHighlightDialogs = jest.fn();
            dialog.focusAnnotationsTextArea = jest.fn();
        });

        it('should create/remove a highlight when the \'highlight-btn\' is pressed', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(DATA_TYPE_HIGHLIGHT_BTN);
            dialog.mousedownHandler(event);
            expect(dialog.emit).toBeCalledWith('annotationdraw');
            expect(dialog.toggleHighlight).toBeCalled();
        });

        it('should create highlight when the \'add-highlight-comment-btn\' is pressed', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(DATA_TYPE_ADD_HIGHLIGHT_COMMENT);
            dialog.mousedownHandler(event);
            expect(dialog.emit).toBeCalledWith('annotationdraw');
            expect(dialog.toggleHighlightCommentsReply).toBeCalled();
            expect(dialog.toggleHighlightDialogs).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(dialog.focusAnnotationsTextArea).toBeCalled();
        });

        it('should not create a highlight when any other button is pressed', () => {
            util.findClosestDataType = jest.fn().mockReturnValue('anything-else');
            dialog.mousedownHandler(event);
            expect(dialog.emit).not.toBeCalledWith('annotationdraw');
        });
    });

    describe('toggleHighlightIcon()', () => {
        it('should display active highlight icon when highlight is active', () => {
            const addHighlightBtn = dialog.element.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_BTN);
            dialog.toggleHighlightIcon(constants.HIGHLIGHT_FILL.active);
            expect(addHighlightBtn.classList.contains(constants.CLASS_ACTIVE)).toBeTruthy();
        });

        it('should display normal \'text highlighted\' highlight icon when highlight is not active', () => {
            const addHighlightBtn = dialog.element.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_BTN);
            dialog.toggleHighlightIcon(constants.HIGHLIGHT_FILL.normal);
            expect(addHighlightBtn.classList.contains(constants.CLASS_ACTIVE)).toBeFalsy();
        });
    });

    describe('toggleHighlight()', () => {
        it('should delete a blank annotation if text is highlighted', () => {
            dialog.dialogEl.classList.add(constants.CLASS_TEXT_HIGHLIGHTED);
            dialog.toggleHighlight();
            expect(dialog.hasComments).toBeTruthy();
            expect(dialog.emit).toBeCalledWith('annotationdelete');
        });

        it('should create a blank annotation if text is not highlighted', () => {
            dialog.dialogEl.classList.remove(constants.CLASS_TEXT_HIGHLIGHTED);

            dialog.toggleHighlight();
            expect(dialog.hasComments).toBeFalsy();
            expect(dialog.emit).toBeCalledWith('annotationcreate');
        });
    });

    describe('focusAnnotationsTextArea()', () => {
        const textarea = {
            focus: jest.fn()
        };

        beforeEach(() => {
            dialog.dialogEl = {
                querySelector: jest.fn().mockReturnValue(textarea)
            };
            dialog.annotationListComponent = null;
        });

        it('should focus the add comment area if it exists', () => {
            util.isElementInViewport = jest.fn().mockReturnValue(true);
            dialog.focusAnnotationsTextArea();
            expect(textarea.focus).toBeCalled();
        });

        it('should do nothing if the add comment area does not exist', () => {
            util.isElementInViewport = jest.fn().mockReturnValue(false);
            dialog.focusAnnotationsTextArea();
            expect(textarea.focus).not.toBeCalled();
        });
    });

    describe('getScaledPDFCoordinates()', () => {
        it('should lower right corner coordinates of dialog when a highlight does not have comments', () => {
            dialog.hasComments = false;

            util.getScale = jest.fn().mockReturnValue(1);
            util.getDimensionScale = jest.fn();
            docUtil.getLowerRightCornerOfLastQuadPoint = jest.fn().mockReturnValue([200, 2]);

            dialog.getScaledPDFCoordinates({}, 100);
            expect(docUtil.getLowerRightCornerOfLastQuadPoint).toBeCalled();
        });
    });

    describe('generateHighlightDialogEl()', () => {
        it('should return a highlight annotation dialog DOM element', () => {
            const highlightEl = dialog.generateHighlightDialogEl(true, true);
            const highlightBtnEl = highlightEl.querySelector(constants.SELECTOR_HIGHLIGHT_BTNS);
            expect(highlightBtnEl).not.toBeNull();
        });

        it('should not add any buttons if the user cannot annotate', () => {
            dialog.canAnnotate = false;
            const highlightEl = dialog.generateHighlightDialogEl(true, true);
            const highlightBtnEl = highlightEl.querySelector(constants.SELECTOR_HIGHLIGHT_BTNS);
            expect(highlightBtnEl).toBeNull();
        });

        it('should not add the add highlight button if the user cannot delete annotations', () => {
            const canDeleteAnnotation = false;
            const highlightEl = dialog.generateHighlightDialogEl(canDeleteAnnotation, true);
            const addHighlightBtn = highlightEl.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_BTN);
            expect(addHighlightBtn).toBeNull();
        });

        it('should not add the comment button if the user does not have highlight comments enabled', () => {
            const showComment = false;
            const highlightEl = dialog.generateHighlightDialogEl(true, showComment);
            const addCommentBtn = highlightEl.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
            expect(addCommentBtn).toBeNull();
        });
    });
});
