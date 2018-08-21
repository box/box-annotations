/* eslint-disable no-unused-expressions */
import Annotation from '../Annotation';
import AnnotationDialog from '../AnnotationDialog';
import AnnotationService from '../AnnotationService';
import * as util from '../util';
import * as constants from '../constants';

const CLASS_FLIPPED_DIALOG = 'ba-annotation-dialog-flipped';
const SELECTOR_COMMENTS_CONTAINER = '.annotation-comments';
const SELECTOR_DELETE_CONFIRMATION = '.delete-confirmation';

let dialog;
const html = `<div class="annotated-element">
<div class="ba-mobile-annotation-dialog">
    <div class="ba-annotation-mobile-header">
        <div class="ba-annotation-dialog-close"></div>
    </div>
</div>
</div>`;

describe('AnnotationDialog', () => {
    let rootElement;
    let annotation;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        dialog = new AnnotationDialog({
            annotatedElement: rootElement,
            container: document,
            location: {},
            annotations: {},
            canAnnotate: true
        });

        const replyContainer = document.createElement('div');
        replyContainer.classList.add(constants.CLASS_REPLY_CONTAINER);
        rootElement.appendChild(replyContainer);

        const replyTextEl = document.createElement('div');
        replyTextEl.classList.add(constants.CLASS_REPLY_TEXTAREA);
        replyContainer.appendChild(replyTextEl);

        dialog.localized = {
            addCommentPlaceholder: 'add comment placeholder',
            posting: 'posting'
        };

        annotation = new Annotation({
            annotationID: 1,
            text: 'the preview sdk is amazing!',
            user: { id: 1, name: 'user' },
            permissions: { can_delete: true }
        });

        dialog.setup();
        document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT).appendChild(dialog.element);

        dialog.emit = jest.fn();
        util.hideElement = jest.fn();
        util.showElement = jest.fn();
        dialog.isMobile = false;
    });

    afterEach(() => {
        const dialogEl = document.querySelector(constants.SELECTOR_ANNOTATED_ELEMENT);
        if (dialogEl && dialogEl.parentNode) {
            dialogEl.parentNode.removeChild(dialogEl);
        }

        dialog.element = null;
        document.body.removeChild(rootElement);
        dialog = null;
    });

    describe('destroy()', () => {
        it('should unbind DOM listeners and cleanup its HTML', () => {
            dialog.unbindDOMListeners = jest.fn();

            dialog.destroy();
            expect(dialog.unbindDOMListeners).toBeCalled();
            expect(dialog.element).toBeNull();
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            dialog.position = jest.fn();
            util.focusTextArea = jest.fn();
            dialog.scrollToLastComment = jest.fn();
            dialog.showMobileDialog = jest.fn();
            dialog.canAnnotate = true;
            dialog.element.classList.add(constants.CLASS_HIDDEN);
        });

        it('should show the mobile dialog if on a mobile device', () => {
            dialog.isMobile = true;
            dialog.show();
            expect(dialog.showMobileDialog).toBeCalled();
            expect(dialog.scrollToLastComment).toBeCalled();
            expect(dialog.emit).toBeCalledWith('annotationshow');
        });

        it('should do nothing if the dialog is already visible ', () => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.show();
            expect(dialog.showMobileDialog).not.toBeCalled();
            expect(dialog.scrollToLastComment).not.toBeCalled();
            expect(dialog.emit).not.toBeCalledWith('annotationshow');
        });

        it('should not reposition the dialog if the reply textarea is already active', () => {
            dialog.hasAnnotations = true;
            dialog.activateReply();

            dialog.show();
            expect(dialog.scrollToLastComment).toBeCalled();
            expect(dialog.position).not.toBeCalled();
            expect(dialog.emit).not.toBeCalledWith('annotationshow');
        });

        it('should position the dialog if not on a mobile device', () => {
            dialog.hasAnnotations = true;
            dialog.deactivateReply();
            const commentsTextArea = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            commentsTextArea.classList.remove(constants.CLASS_ACTIVE);

            dialog.show();
            expect(dialog.position).toBeCalled();
            expect(dialog.scrollToLastComment).toBeCalled();
            expect(dialog.emit).toBeCalledWith('annotationshow');
        });
    });

    describe('scrollToLastComment()', () => {
        beforeEach(() => {
            util.focusTextArea = jest.fn();
        });

        it('should activate the reply text area if the dialog has multiple annotations', () => {
            dialog.hasAnnotations = true;
            dialog.activateReply = jest.fn();

            dialog.scrollToLastComment();
            expect(dialog.activateReply);
            expect(util.focusTextArea);
        });

        it('should set the dialog scroll height to the bottom of the comments container', () => {
            const annotationEl = {
                scrollHeight: 500,
                clientHeight: 300,
                scrollTop: 0
            };
            dialog.element.querySelector = jest.fn().mockReturnValue(annotationEl);

            dialog.scrollToLastComment();
            expect(annotationEl.scrollTop).toEqual(200);
        });

        it('should set the flipped dialog scroll height to the bottom of the comments container', () => {
            const annotationEl = {
                scrollHeight: 500,
                clientHeight: 500,
                scrollTop: 0
            };
            dialog.dialogEl.classList.add('ba-annotation-dialog-flipped');
            dialog.element.querySelector = jest.fn().mockReturnValue(annotationEl);

            dialog.scrollToLastComment();
            expect(annotationEl.scrollTop).toEqual(500);
        });
    });

    describe('showMobileDialog()', () => {
        beforeEach(() => {
            dialog.bindDOMListeners = jest.fn();

            dialog.container = document.createElement('div');
            dialog.container.querySelector = jest.fn().mockReturnValue(dialog.element);

            dialog.element.classList.add(constants.CLASS_MOBILE_ANNOTATION_DIALOG);
            dialog.element.classList.add(constants.CLASS_HIDDEN);

            dialog.element.querySelector = jest.fn().mockReturnValue(document.createElement('div'));
        });

        it('should populate the mobile dialog if using a mobile browser', () => {
            dialog.highlightDialogEl = null;

            dialog.showMobileDialog();
            expect(util.showElement).toBeCalledWith(dialog.element);
            expect(dialog.bindDOMListeners).toBeCalled();
            expect(dialog.element.classList.contains(constants.CLASS_MOBILE_ANNOTATION_DIALOG)).toBeTruthy();
            expect(dialog.element.classList.contains(constants.CLASS_ANIMATE_DIALOG)).toBeTruthy();
        });

        it('should reset the annotation dialog to be a plain highlight if no comments are present', () => {
            dialog.highlightDialogEl = {};

            const headerEl = document.createElement('div');
            headerEl.classList.add(constants.CLASS_MOBILE_DIALOG_HEADER);
            dialog.element.appendChild(headerEl);

            dialog.showMobileDialog();

            expect(dialog.element.classList).toContain(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT);
        });

        it('should not re-show the dialog if it is already visible', () => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.showMobileDialog();
            expect(util.showElement).not.toBeCalled();
        });
    });

    describe('hideMobileDialog()', () => {
        it('should do nothing if the dialog element does not exist', () => {
            dialog.element = null;
            dialog.hideMobileDialog();
            expect(util.hideElement).not.toBeCalled();
        });

        it('should hide the mobile annotations dialog', () => {
            dialog.element = document.querySelector(constants.SELECTOR_MOBILE_ANNOTATION_DIALOG);
            dialog.unbindDOMListeners = jest.fn();
            dialog.hasAnnotations = true;

            dialog.hideMobileDialog();
            expect(util.hideElement).toBeCalled();
            expect(dialog.unbindDOMListeners).toBeCalled();
        });
    });

    describe('hide()', () => {
        beforeEach(() => {
            dialog.isMobile = false;
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.unbindDOMListeners = jest.fn();
        });

        it('should do nothing if element is already hidden', () => {
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            dialog.hide();
            expect(util.hideElement).not.toBeCalled();
            expect(dialog.emit).not.toBeCalledWith('annotationhide');
        });

        it('should hide dialog immediately', () => {
            dialog.toggleFlippedThreadEl = jest.fn();
            dialog.hide();
            expect(util.hideElement).toBeCalledWith(dialog.element);
            expect(dialog.toggleFlippedThreadEl).toBeCalled();
            expect(dialog.emit).toBeCalledWith('annotationhide');
        });

        it('should hide the mobile dialog if using a mobile browser', () => {
            dialog.isMobile = true;
            dialog.hideMobileDialog = jest.fn();
            dialog.toggleFlippedThreadEl = jest.fn();
            dialog.hide();
            expect(dialog.hideMobileDialog).toBeCalled();
            expect(dialog.toggleFlippedThreadEl).toBeCalled();
            dialog.element = null;
            expect(dialog.emit).toBeCalledWith('annotationhide');
        });
    });

    describe('addAnnotation()', () => {
        beforeEach(() => {
            dialog.addAnnotationElement = jest.fn();
        });

        it('should add annotation to the dialog and deactivate the reply area', () => {
            dialog.addAnnotation(new Annotation({}));
            expect(dialog.addAnnotationElement).toBeCalled();
        });

        it('should hide the create section and show the show section if there are no annotations', () => {
            dialog.hasAnnotations = false;

            dialog.addAnnotation(new Annotation({}));
            const createSectionEl = document.querySelector(constants.SECTION_CREATE);
            const showSectionEl = document.querySelector(constants.SECTION_SHOW);
            expect(util.hideElement).toBeCalledWith(createSectionEl);
            expect(util.showElement).toBeCalledWith(showSectionEl);
        });
    });

    describe('removeAnnotation()', () => {
        it('should remove annotation element and deactivate reply', () => {
            dialog.addAnnotation(annotation);

            dialog.removeAnnotation('someID');
            const annotationEl = dialog.element.querySelector('[data-annotation-id="someID"]');
            expect(annotationEl).toBeNull();
        });

        it('should focus the reply text area', () => {
            const replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.focus = jest.fn();
            dialog.removeAnnotation('someID');
            expect(replyTextEl.focus).toBeCalled();
        });
    });

    describe('element()', () => {
        it('should return dialog element', () => {
            expect(dialog.element).toEqual(dialog.element);
        });
    });

    describe('setup()', () => {
        beforeEach(() => {
            const dialogEl = document.createElement('div');
            dialog.generateDialogEl = jest.fn().mockReturnValue(dialogEl);
            dialog.bindDOMListeners = jest.fn();
            dialog.addSortedAnnotations = jest.fn();
            dialog.unbindDOMListeners = jest.fn();
            dialog.isMobile = false;
        });

        it('should set up HTML element, add annotations to the dialog, and bind DOM listeners', () => {
            dialog.setup([annotation], {});
            expect(dialog.element).not.toBeNull();
            expect(dialog.bindDOMListeners).toBeCalled();
            expect(dialog.threadEl).not.toBeUndefined();
        });

        it('should not create dialog element if using a mobile browser', () => {
            dialog.isMobile = true;
            dialog.setup([annotation, annotation], {});
            expect(dialog.bindDOMListeners).not.toBeCalled();
            expect(dialog.addSortedAnnotations).toBeCalled();
            dialog.element = null;
        });
    });

    describe('addSortedAnnotations()', () => {
        it('should add annotations to the dialog in chronological order', () => {
            // Dates are provided as a string format from the API such as "2016-10-30T14:19:56",
            // ensures that the method converts to a Date() format for comparison/sorting
            // Hard coding dates to ensure formatting resembles API response
            const threadID = AnnotationService.generateID();
            const annotation1 = new Annotation({
                annotationID: 1,
                threadID,
                text: 'blah',
                threadNumber: '1',
                user: { id: 1 },
                permissions: { can_delete: false },
                created: '2016-10-29T14:19:56'
            });

            // Ensures annotations are not provided in chronological order
            const annotation3 = new Annotation({
                annotationID: 3,
                threadID,
                text: 'blah3',
                threadNumber: '1',
                user: { id: 1 },
                permissions: { can_delete: false },
                created: '2016-10-30T14:19:56'
            });

            const annotation2 = new Annotation({
                annotationID: 2,
                threadID,
                text: 'blah2',
                threadNumber: '1',
                user: { id: 1 },
                permissions: { can_delete: false },
                created: '2016-10-30T14:20:56'
            });

            // Chronologically ordered by annotationID -> [1, 3, 2]
            const annotations = {
                1: annotation1,
                2: annotation2,
                3: annotation3
            };

            dialog.addSortedAnnotations(annotations);
            const annotationContainerEl = dialog.dialogEl.querySelector(SELECTOR_COMMENTS_CONTAINER);
            expect(annotationContainerEl.childNodes[0].dataset.annotationId).toEqual('1');
            expect(annotationContainerEl.childNodes[1].dataset.annotationId).toEqual('3');
            expect(annotationContainerEl.childNodes[2].dataset.annotationId).toEqual('2');
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            dialog.replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            dialog.annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            dialog.element.addEventListener = jest.fn();
            dialog.replyTextEl.addEventListener = jest.fn();
            dialog.annotationTextEl.addEventListener = jest.fn();
        });

        it('should bind ALL DOM listeners for touch enabled laptops', () => {
            dialog.hasTouch = true;

            dialog.bindDOMListeners();
            expect(dialog.element.addEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('wheel', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('touchstart', dialog.clickHandler);
            expect(dialog.element.addEventListener).toBeCalledWith('touchstart', dialog.stopPropagation);
            expect(dialog.replyTextEl.addEventListener).toBeCalledWith('focus', expect.any(Function));
            expect(dialog.annotationTextEl.addEventListener).toBeCalledWith('focus', expect.any(Function));
        });

        it('should not bind touch events if not on a touch enabled devices', () => {
            dialog.bindDOMListeners();
            expect(dialog.element.addEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('wheel', expect.any(Function));
            expect(dialog.element.addEventListener).not.toBeCalledWith('touchstart', dialog.clickHandler);
            expect(dialog.element.addEventListener).not.toBeCalledWith('touchstart', dialog.stopPropagation);
            dialog.element = null;
        });

        it('should not bind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;

            dialog.bindDOMListeners();
            expect(dialog.element.addEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.addEventListener).not.toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.addEventListener).toBeCalledWith('wheel', expect.any(Function));
            dialog.element = null;
        });
    });

    describe('validateTextArea()', () => {
        const textEl = document.createElement('textarea');

        it('should do nothing if textarea is blank', () => {
            textEl.classList.add(constants.CLASS_INVALID_INPUT);
            dialog.validateTextArea({ target: textEl });
            expect(textEl.classList).toContain(constants.CLASS_INVALID_INPUT);
        });

        it('should remove red border around textarea', () => {
            textEl.classList.add(constants.CLASS_INVALID_INPUT);
            textEl.value = 'words';
            dialog.validateTextArea({ target: textEl });
            expect(textEl.classList).not.toContain(constants.CLASS_INVALID_INPUT);
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            dialog.replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            dialog.annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            dialog.element.removeEventListener = jest.fn();
            dialog.replyTextEl.removeEventListener = jest.fn();
            dialog.annotationTextEl.removeEventListener = jest.fn();
        });

        it('should unbind ALL DOM listeners for touch enabled laptops', () => {
            dialog.hasTouch = true;

            dialog.unbindDOMListeners();
            expect(dialog.element.removeEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('touchstart', dialog.clickHandler);
            expect(dialog.element.removeEventListener).toBeCalledWith('touchstart', dialog.stopPropagation);
            expect(dialog.element.removeEventListener).toBeCalledWith('wheel', expect.any(Function));
            expect(dialog.replyTextEl.removeEventListener).toBeCalledWith('focus', dialog.validateTextArea);
            expect(dialog.annotationTextEl.removeEventListener).toBeCalledWith('focus', dialog.validateTextArea);
        });

        it('should not bind touch events if not on a touch enabled devices', () => {
            dialog.unbindDOMListeners();
            expect(dialog.element.removeEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('wheel', expect.any(Function));
            expect(dialog.element.removeEventListener).not.toBeCalledWith('touchstart', dialog.clickHandler);
            expect(dialog.element.removeEventListener).not.toBeCalledWith('touchstart', dialog.stopPropagation);
            dialog.element = null;
        });

        it('should not bind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;

            dialog.unbindDOMListeners();
            expect(dialog.element.removeEventListener).toBeCalledWith('keydown', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(dialog.element.removeEventListener).not.toBeCalledWith('click', expect.any(Function));
            expect(dialog.element.removeEventListener).toBeCalledWith('wheel', expect.any(Function));
        });
    });

    describe('keydownHandler()', () => {
        it('should cancel any unsaved annotations when user presses Esc on pending dialog', () => {
            dialog.cancelAnnotation = jest.fn();
            dialog.hasAnnotations = false;

            dialog.keydownHandler({
                key: 'U+001B', // esc key
                stopPropagation: jest.fn()
            });
            expect(dialog.cancelAnnotation).toBeCalled();
        });

        it('should hide the dialog when user presses Esc if not creating a new annotation', () => {
            dialog.hide = jest.fn();
            dialog.hasAnnotations = true;

            dialog.keydownHandler({
                key: 'U+001B', // esc key
                stopPropagation: jest.fn()
            });
            expect(dialog.hide).toBeCalled();
        });

        it('should scroll to the bottom area when user presses a key inside the reply area', () => {
            dialog.scrollToLastComment = jest.fn();

            dialog.keydownHandler({
                key: ' ', // space
                target: document.querySelector(constants.SELECTOR_REPLY_TEXTAREA),
                stopPropagation: jest.fn()
            });
            expect(dialog.scrollToLastComment).toBeCalled();
        });
    });

    describe('stopPropagation()', () => {
        it('should stop propagation on the event', () => {
            const event = {
                stopPropagation: jest.fn()
            };

            dialog.stopPropagation(event);
            expect(event.stopPropagation).toBeCalled();
        });
    });

    describe('enable()', () => {
        it('should enable all buttons in specified annotation element', () => {
            dialog.element = document.createElement('div');

            const annotationEl = document.createElement('div');
            annotationEl.setAttribute('data-annotation-id', '123');
            dialog.element.appendChild(annotationEl);

            // Add buttons
            const btn = document.createElement('button');
            btn.classList.add(constants.CLASS_DISABLED);
            annotationEl.querySelectorAll = jest.fn().mockReturnValue([btn, btn]);

            const wrongEl = document.createElement('div');
            wrongEl.setAttribute('data-annotation-id', 'invalid');
            wrongEl.querySelectorAll = jest.fn();
            dialog.element.appendChild(wrongEl);

            dialog.enable('123');
            expect(annotationEl.querySelectorAll).toBeCalled();
            expect(btn.classList).not.toContain(constants.CLASS_DISABLED);
            expect(wrongEl.querySelectorAll).not.toBeCalled();
        });
    });

    describe('disable()', () => {
        it('should disable all buttons in specified annotation element', () => {
            dialog.element = document.createElement('div');

            const annotationEl = document.createElement('div');
            annotationEl.setAttribute('data-annotation-id', '123');
            dialog.element.appendChild(annotationEl);

            // Add buttons
            const btn = document.createElement('button');
            annotationEl.querySelectorAll = jest.fn().mockReturnValue([btn, btn]);

            const wrongEl = document.createElement('div');
            wrongEl.setAttribute('data-annotation-id', 'invalid');
            wrongEl.querySelectorAll = jest.fn();
            dialog.element.appendChild(wrongEl);

            dialog.disable('123');
            expect(annotationEl.querySelectorAll).toBeCalled();
            expect(btn.classList).toContain(constants.CLASS_DISABLED);
            expect(wrongEl.querySelectorAll).not.toBeCalled();
        });
    });

    describe('clickHandler()', () => {
        let event;

        beforeEach(() => {
            event = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                target: document.createElement('div')
            };

            dialog.postAnnotation = jest.fn();
            dialog.cancelAnnotation = jest.fn();
            dialog.deactivateReply = jest.fn();
            dialog.activateReply = jest.fn();
            util.findClosestDataType = jest.fn();
            dialog.showDeleteConfirmation = jest.fn();
            dialog.hideDeleteConfirmation = jest.fn();
            dialog.deleteAnnotation = jest.fn();
            dialog.postReply = jest.fn();
            dialog.hideMobileDialog = jest.fn();

            dialog.isMobile = false;
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
        });

        it('should only stop propagation on a desktop device', () => {
            dialog.clickHandler(event);
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).not.toBeCalled();
        });

        it('should only stop propagation on a mobile device', () => {
            dialog.isMobile = true;
            dialog.clickHandler(event);
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).not.toBeCalled();
        });

        it('should only prevent default on button clicks for mobile devices', () => {
            event.target = document.createElement('button');
            dialog.isMobile = true;
            dialog.clickHandler(event);
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should post annotation when post annotation button is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_POST);

            dialog.clickHandler(event);
            expect(dialog.postAnnotation).toBeCalled();
        });

        it('should cancel annotation when cancel annotation button is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_CANCEL);
            dialog.clickHandler(event);
            expect(dialog.cancelAnnotation).toBeCalled();
        });

        it('should cancel annotation when mobile dialog close button is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_MOBILE_CLOSE);
            dialog.clickHandler(event);
            expect(dialog.cancelAnnotation).toBeCalled();
        });

        it('should activate reply area when textarea is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_REPLY_TEXTAREA);

            dialog.clickHandler(event);
            expect(dialog.activateReply).toBeCalled();
        });

        it('should deactivate reply area when cancel reply button is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_CANCEL_REPLY);

            dialog.clickHandler(event);
            expect(dialog.deactivateReply).toBeCalledWith(true);
        });

        it('should post reply when post reply button is clicked', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(constants.DATA_TYPE_POST_REPLY);

            dialog.clickHandler(event);
            expect(dialog.postReply).toBeCalled();
        });

        it('should show delete confirmation when delete button is clicked', () => {
            util.findClosestDataType = jest
                .fn()
                .mockReturnValueOnce(constants.DATA_TYPE_DELETE)
                .mockReturnValue('someID');

            dialog.clickHandler(event);
            expect(dialog.showDeleteConfirmation).toBeCalledWith('someID');
        });

        it('should cancel deletion when cancel delete button is clicked', () => {
            util.findClosestDataType = jest
                .fn()
                .mockReturnValueOnce(constants.DATA_TYPE_CANCEL_DELETE)
                .mockReturnValue('someID');

            dialog.clickHandler(event);
            expect(dialog.hideDeleteConfirmation).toBeCalledWith('someID');
        });

        it('should confirm deletion when confirm delete button is clicked', () => {
            util.findClosestDataType = jest
                .fn()
                .mockReturnValueOnce(constants.DATA_TYPE_CONFIRM_DELETE)
                .mockReturnValue('someID');

            dialog.clickHandler(event);
            expect(dialog.deleteAnnotation).toBeCalledWith('someID');
        });

        it('should do nothing if dataType does not match any button in the annotation dialog', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(null);

            dialog.clickHandler(event);
            expect(dialog.postAnnotation).not.toBeCalled();
            expect(dialog.postReply).not.toBeCalled();
            expect(dialog.cancelAnnotation).not.toBeCalled();
            expect(dialog.deactivateReply).not.toBeCalled();
            expect(dialog.activateReply).not.toBeCalled();
            expect(dialog.postReply).not.toBeCalled();
            expect(dialog.showDeleteConfirmation).not.toBeCalled();
            expect(dialog.hideDeleteConfirmation).not.toBeCalled();
            expect(dialog.deleteAnnotation).not.toBeCalled();
        });
    });

    describe('addAnnotationElement()', () => {
        let newAnnotation = {};

        beforeEach(() => {
            newAnnotation = {
                annotationID: 1,
                text: 'the preview sdk is awesome!',
                user: { id: 1, name: 'user' },
                permissions: {},
                created: 'March 18, 1992 00:00:00'
            };
            dialog.renderUserProfile = jest.fn();
        });

        it('should add an annotation comment if text is present', () => {
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const annotationComment = document.querySelector(constants.SELECTOR_ANNOTATION_COMMENT_TEXT);
            expect(annotationComment.textContent).toContain('the preview sdk is awesome!');
        });

        it('should render the Profile component with the posting message if the user id is 0', () => {
            newAnnotation.user = { id: 0 };
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const user = {
                id: '0',
                name: dialog.localized.posting,
                avatarUrl: ''
            };
            expect(dialog.renderUserProfile).toBeCalledWith(user, '1992-03-18 00:00');
        });

        it('should render the Profile component with the user\'s name', () => {
            newAnnotation.user = { id: 1, name: 'user' };
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const user = {
                id: '1',
                name: 'user',
                avatarUrl: ''
            };
            expect(dialog.renderUserProfile).toBeCalledWith(user, '1992-03-18 00:00');
        });

        it('should not the delete icon if the user does not have delete permissions', () => {
            newAnnotation.permissions = { can_delete: false };
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const deleteButton = document.querySelector(constants.SELECTOR_DELETE_COMMENT_BTN);
            expect(deleteButton).toBeNull();
        });

        it('should not add the delete icon if the delete permission is not specified', () => {
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const deleteButton = document.querySelector(constants.SELECTOR_DELETE_COMMENT_BTN);
            expect(deleteButton).toBeNull();
        });

        it('should make delete icon visible if the user has delete permission', () => {
            newAnnotation.permissions = { can_delete: true };
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const deleteButton = document.querySelector(constants.SELECTOR_DELETE_COMMENT_BTN);
            expect(deleteButton.classList).not.toContain(constants.CLASS_HIDDEN);
        });

        it('should hide the delete confirmation UI by default', () => {
            newAnnotation.permissions = { can_delete: true };
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const deleteConfirmation = document.querySelector(SELECTOR_DELETE_CONFIRMATION);
            expect(deleteConfirmation.classList).toContain(constants.CLASS_HIDDEN);
        });

        it('should add a <br> for each newline', () => {
            const withBreaks = `


            yay, three breaks!`;
            newAnnotation.text = withBreaks;
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const breaks = document.querySelectorAll(`${constants.SELECTOR_ANNOTATION_COMMENT_TEXT} br`);
            expect(breaks.length).toBeTruthy();
        });

        it('should respect symbols added to the text', () => {
            const text = 'I can add symbols &&&';
            newAnnotation.text = text;
            dialog.addAnnotationElement(new Annotation(newAnnotation));
            const annotationComment = document.querySelector(constants.SELECTOR_ANNOTATION_COMMENT_TEXT);
            expect(annotationComment.textContent).toEqual(text);
            expect(annotationComment.textContent).toContain('&&&');
        });
    });

    describe('postAnnotation()', () => {
        it('should not post an annotation to the dialog if it has no text', () => {
            const annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            dialog.postAnnotation();
            expect(dialog.emit).not.toBeCalled();
            expect(annotationTextEl.classList).toContain(constants.CLASS_INVALID_INPUT);
        });

        it('should post an annotation to the dialog if it has text', () => {
            document.querySelector('textarea').innerHTML += 'the preview SDK is great!';

            dialog.postAnnotation();
            expect(dialog.emit).toBeCalledWith('annotationcreate', { text: 'the preview SDK is great!' });
        });

        it('should clear the annotation text element after posting', () => {
            const annotationTextEl = document.querySelector('textarea');
            annotationTextEl.innerHTML += 'the preview SDK is great!';

            dialog.postAnnotation();
            expect(annotationTextEl.value).toEqual('');
        });
    });

    describe('cancelAnnotation()', () => {
        it('should emit the annotationcancel message', () => {
            dialog.cancelAnnotation();
            expect(dialog.emit).toBeCalledWith('annotationcancel');
        });
    });

    describe('activateReply()', () => {
        it('should do nothing if the dialogEl does not exist', () => {
            dialog.dialogEl = null;
            dialog.activateReply();
            expect(util.showElement).not.toBeCalled();
        });

        it('should do nothing if reply textarea is already active', () => {
            const replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.classList.add(constants.CLASS_ACTIVE);
            dialog.activateReply();
            expect(util.showElement).not.toBeCalled();
        });

        it('should do nothing if reply text area does not exist', () => {
            const replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.parentNode.removeChild(replyTextEl);
            dialog.activateReply();
            expect(util.showElement).not.toBeCalled();
        });

        it('should show the correct UI when the reply textarea is activated', () => {
            document.querySelector('textarea').textContent = 'the preview SDK is great!';
            const replyTextEl = document.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.classList.remove(constants.CLASS_ACTIVE);

            dialog.activateReply();
            expect(replyTextEl.classList).toContain(constants.CLASS_ACTIVE);
        });
    });

    describe('deactivateReply()', () => {
        it('should do nothing if element does not exist', () => {
            dialog.dialogEl = null;
            util.resetTextarea = jest.fn();

            dialog.deactivateReply();
            expect(util.resetTextarea).not.toBeCalled();
        });

        it('should do nothing if reply text area does not exist', () => {
            const replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.parentNode.removeChild(replyTextEl);
            dialog.deactivateReply();
            expect(util.showElement).not.toBeCalled();
        });

        it('should show the correct UI when the reply textarea is deactivated', () => {
            const replyTextEl = document.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            const buttonContainer = replyTextEl.parentNode.querySelector(constants.SELECTOR_BUTTON_CONTAINER);

            dialog.deactivateReply();
            expect(replyTextEl.classList).not.toContain(constants.CLASS_ACTIVE);
            expect(buttonContainer.classList).toContain(constants.CLASS_HIDDEN);
        });
    });

    describe('postReply()', () => {
        it('should not post reply to the dialog if it has no text', () => {
            const replyTextEl = dialog.element.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            dialog.postReply();
            expect(dialog.emit).not.toBeCalled();
            expect(replyTextEl.classList).toContain(constants.CLASS_INVALID_INPUT);
        });

        it('should post a reply to the dialog if it has text', () => {
            const replyTextEl = document.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.innerHTML += 'the preview SDK is great!';
            dialog.postReply();
            expect(dialog.emit).toBeCalledWith('annotationcreate', { text: 'the preview SDK is great!' });
        });

        it('should clear the reply text element after posting', () => {
            const replyTextEl = document.querySelector(constants.SELECTOR_REPLY_TEXTAREA);
            replyTextEl.innerHTML += 'the preview SDK is great!';
            replyTextEl.focus = jest.fn();

            dialog.postReply();
            expect(replyTextEl.value).toEqual('');
            expect(replyTextEl.focus).toBeCalled();
        });
    });

    describe('showDeleteConfirmation()', () => {
        it('should show the correct UI when a user clicks on delete', () => {
            dialog.addAnnotationElement(annotation);
            dialog.showDeleteConfirmation(1);
            expect(util.showElement).toBeCalled();
        });
    });

    describe('hideDeleteConfirmation()', () => {
        it('should show the correct UI when a user clicks cancel in the delete confirmation', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            dialog.showDeleteConfirmation(1);

            dialog.hideDeleteConfirmation(1);
            expect(util.hideElement).toBeCalled();
        });
    });

    describe('deleteAnnotation()', () => {
        it('should emit the annotationdelete message', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );

            dialog.deleteAnnotation(1);
            expect(dialog.emit).toBeCalledWith('annotationdelete', { annotationID: 1 });
        });
    });

    describe('generateDialogEl', () => {
        it('should generate a blank annotations dialog element', () => {
            const dialogEl = dialog.generateDialogEl(0);
            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl.classList).not.toContain(constants.CLASS_HIDDEN);
            expect(showSectionEl.classList).toContain(constants.CLASS_HIDDEN);
        });

        it('should generate an annotations dialog element with annotations', () => {
            const dialogEl = dialog.generateDialogEl(1);
            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl.classList).toContain(constants.CLASS_HIDDEN);
            expect(showSectionEl.classList).not.toContain(constants.CLASS_HIDDEN);
        });

        it('should not add the create section nor the reply container in read-only mode', () => {
            dialog.canAnnotate = false;
            const dialogEl = dialog.generateDialogEl(1);

            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const replyContainerEl = dialogEl.querySelector(constants.SELECTOR_REPLY_CONTAINER);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl).toBeNull();
            expect(replyContainerEl).toBeNull();
            expect(showSectionEl.classList).not.toContain(constants.CLASS_HIDDEN);
        });
    });

    describe('flipDialog()', () => {
        const containerHeight = 5;

        beforeEach(() => {
            dialog.element = document.createElement('div');
            dialog.element.querySelector = jest.fn().mockReturnValue(document.createElement('div'));
            dialog.fitDialogHeightInPage = jest.fn();
            dialog.toggleFlippedThreadEl = jest.fn();
        });

        afterEach(() => {
            dialog.element = null;
        });

        it('should keep the dialog below the annotation icon if the annotation is in the top half of the viewport', () => {
            const { top, bottom } = dialog.flipDialog(2, containerHeight);
            expect(dialog.element.classList).not.toContain(CLASS_FLIPPED_DIALOG);
            expect(top).not.toEqual('');
            expect(bottom).toEqual('');
            expect(dialog.fitDialogHeightInPage).toBeCalled();
            expect(dialog.toggleFlippedThreadEl).toBeCalled();
        });

        it('should flip the dialog above the annotation icon if the annotation is in the lower half of the viewport', () => {
            const { top, bottom } = dialog.flipDialog(4, containerHeight);
            expect(dialog.element.classList).toContain(CLASS_FLIPPED_DIALOG);
            expect(top).toEqual('');
            expect(bottom).not.toEqual('');
        });
    });

    describe('toggleFlippedThreadEl()', () => {
        beforeEach(() => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.threadEl = document.createElement('div');
        });

        it('should do nothing if the dialog is not flipped', () => {
            dialog.toggleFlippedThreadEl();
            expect(dialog.threadEl.classList).not.toContain(CLASS_FLIPPED_DIALOG);
        });

        it('should reset thread icon if dialog is flipped and hidden', () => {
            dialog.element.classList.add(CLASS_FLIPPED_DIALOG);
            dialog.toggleFlippedThreadEl();
            expect(dialog.threadEl.classList).toContain(CLASS_FLIPPED_DIALOG);
        });

        it('should flip thread icon if dialog is flipped and not hidden', () => {
            dialog.element.classList.add(CLASS_FLIPPED_DIALOG);
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            dialog.toggleFlippedThreadEl();
            expect(dialog.threadEl.classList).not.toContain(CLASS_FLIPPED_DIALOG);
        });
    });

    describe('fitDialogHeightInPage()', () => {
        it('should allow scrolling on annotations dialog if file is a powerpoint', () => {
            dialog.dialogEl = {
                style: {},
                querySelector: jest.fn().mockReturnValue(null)
            };
            dialog.container = { clientHeight: 100 };
            dialog.fitDialogHeightInPage();
            expect(dialog.dialogEl.style.maxHeight).toEqual('20px');
        });

        it('should allow scrolling on annotations dialog if file is a powerpoint', () => {
            const commentsEl = document.createElement('div');
            dialog.dialogEl = {
                style: {},
                querySelector: jest.fn().mockReturnValue(commentsEl)
            };
            dialog.container = { clientHeight: 100 };
            dialog.fitDialogHeightInPage();
            expect(dialog.dialogEl.style.maxHeight).toEqual('20px');
            expect(commentsEl.style.maxHeight).toEqual('20px');
        });
    });
});
