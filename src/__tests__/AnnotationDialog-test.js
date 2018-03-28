/* eslint-disable no-unused-expressions */
import Annotation from '../Annotation';
import AnnotationDialog from '../AnnotationDialog';
import AnnotationService from '../AnnotationService';
import * as util from '../util';
import * as constants from '../constants';

const CLASS_FLIPPED_DIALOG = 'ba-annotation-dialog-flipped';
const CLASS_CANCEL_DELETE = 'cancel-delete-btn';
const CLASS_REPLY_TEXTAREA = 'reply-textarea';
const CLASS_REPLY_CONTAINER = 'reply-container';
const CLASS_ANIMATE_DIALOG = 'ba-animate-show-dialog';
const CLASS_BUTTON_DELETE_COMMENT = 'delete-comment-btn';
const CLASS_COMMENTS_CONTAINER = 'annotation-comments';
const SELECTOR_DELETE_CONFIRMATION = '.delete-confirmation';
const CLASS_INVALID_INPUT = 'ba-invalid-input';

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

let dialog;
const sandbox = sinon.sandbox.create();
let stubs = {};

describe('AnnotationDialog', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('__tests__/AnnotationDialog-test.html');

        dialog = new AnnotationDialog({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            container: document,
            location: {},
            annotations: {},
            canAnnotate: true
        });
        dialog.localized = {
            addCommentPlaceholder: 'add comment placeholder',
            posting: 'posting'
        };
        dialog.setup([]);
        document.querySelector(SELECTOR_ANNOTATED_ELEMENT).appendChild(dialog.element);

        stubs.emit = sandbox.stub(dialog, 'emit');
        dialog.isMobile = false;
    });

    afterEach(() => {
        const dialogEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
        if (dialogEl && dialogEl.parentNode) {
            dialogEl.parentNode.removeChild(dialogEl);
        }

        dialog.element = null;

        sandbox.verifyAndRestore();
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }

        stubs = {};
    });

    describe('destroy()', () => {
        it('should unbind DOM listeners and cleanup its HTML', () => {
            const unbindStub = sandbox.stub(dialog, 'unbindDOMListeners');

            dialog.destroy();
            expect(unbindStub).to.be.called;
            expect(dialog.element).to.be.null;
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            stubs.position = sandbox.stub(dialog, 'position');
            stubs.focus = sandbox.stub(util, 'focusTextArea');
            stubs.scroll = sandbox.stub(dialog, 'scrollToLastComment');
            sandbox.stub(dialog, 'showMobileDialog');
            dialog.canAnnotate = true;
            dialog.element.classList.add(constants.CLASS_HIDDEN);
        });

        it('should show the mobile dialog if on a mobile device', () => {
            dialog.isMobile = true;
            dialog.show();
            expect(dialog.showMobileDialog).to.be.called;
            expect(stubs.scroll).to.be.called;
        });

        it('should do nothing if the dialog is already visible ', () => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.show();
            expect(dialog.showMobileDialog).to.not.be.called;
            expect(stubs.scroll).to.not.be.called;
        });

        it('should not reposition the dialog if the reply textarea is already active', () => {
            dialog.hasAnnotations = true;
            dialog.activateReply();

            dialog.show();
            expect(stubs.scroll).to.be.called;
            expect(stubs.position).to.not.be.called;
        });

        it('should position the dialog if not on a mobile device', () => {
            dialog.hasAnnotations = true;
            dialog.deactivateReply();
            const commentsTextArea = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            commentsTextArea.classList.remove('bp-is-active');

            dialog.show();
            expect(stubs.position).to.be.called;
            expect(stubs.scroll).to.be.called;
        });
    });

    describe('scrollToLastComment()', () => {
        beforeEach(() => {
            sandbox.stub(util, 'focusTextArea');
        });

        it('should activate the reply text area if the dialog has multiple annotations', () => {
            dialog.hasAnnotations = true;
            sandbox.stub(dialog, 'activateReply');

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
            sandbox.stub(dialog.element, 'querySelector').returns(annotationEl);

            dialog.scrollToLastComment();
            expect(annotationEl.scrollTop).to.equal(200);
        });

        it('should set the flipped dialog scroll height to the bottom of the comments container', () => {
            const annotationEl = {
                scrollHeight: 500,
                clientHeight: 500,
                scrollTop: 0
            };
            dialog.dialogEl.classList.add('ba-annotation-dialog-flipped');
            sandbox.stub(dialog.element, 'querySelector').returns(annotationEl);

            dialog.scrollToLastComment();
            expect(annotationEl.scrollTop).to.equal(500);
        });
    });

    describe('showMobileDialog()', () => {
        beforeEach(() => {
            stubs.show = sandbox.stub(util, 'showElement');
            stubs.bind = sandbox.stub(dialog, 'bindDOMListeners');

            dialog.container = {
                querySelector: sandbox.stub().returns(dialog.element)
            };

            dialog.element.classList.add(constants.CLASS_MOBILE_ANNOTATION_DIALOG);
            dialog.element.classList.add(constants.CLASS_HIDDEN);

            sandbox.stub(dialog.element, 'querySelector').returns(document.createElement('div'));
        });

        it('should populate the mobile dialog if using a mobile browser', () => {
            dialog.highlightDialogEl = null;

            dialog.showMobileDialog();
            expect(stubs.show).to.be.calledWith(dialog.element);
            expect(stubs.bind).to.be.called;
            expect(dialog.element.classList.contains(constants.CLASS_MOBILE_ANNOTATION_DIALOG)).to.be.true;
            expect(dialog.element.classList.contains(CLASS_ANIMATE_DIALOG)).to.be.true;
        });

        it('should reset the annotation dialog to be a plain highlight if no comments are present', () => {
            dialog.highlightDialogEl = {};
            sandbox
                .stub(dialog.element, 'querySelectorAll')
                .withArgs('.annotation-comment')
                .returns([]);
            dialog.showMobileDialog();

            expect(dialog.element.classList.contains(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT)).to.be.true;
        });

        it('should not re-show the dialog if it is already visible', () => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.showMobileDialog();
            expect(stubs.show).to.not.be.called;
        });
    });

    describe('hideMobileDialog()', () => {
        it('should do nothing if the dialog element does not exist', () => {
            dialog.element = null;
            stubs.hide = sandbox.stub(util, 'hideElement');
            dialog.hideMobileDialog();
            expect(stubs.hide).to.not.be.called;
        });

        it('should hide the mobile annotations dialog', () => {
            dialog.element = document.querySelector(constants.SELECTOR_MOBILE_ANNOTATION_DIALOG);
            stubs.hide = sandbox.stub(util, 'hideElement');
            stubs.unbind = sandbox.stub(dialog, 'unbindDOMListeners');
            stubs.cancel = sandbox.stub(dialog, 'cancelAnnotation');
            dialog.hasAnnotations = true;

            dialog.hideMobileDialog();
            expect(stubs.hide).to.be.called;
            expect(stubs.unbind).to.be.called;
            expect(stubs.cancel).to.be.called;
        });

        it('should cancel unsaved annotations only if the dialog does not have annotations', () => {
            dialog.element = document.querySelector(constants.SELECTOR_MOBILE_ANNOTATION_DIALOG);
            stubs.cancel = sandbox.stub(dialog, 'cancelAnnotation');
            dialog.hasAnnotations = false;

            dialog.hideMobileDialog();
            expect(stubs.cancel).to.be.called;
        });
    });

    describe('hide()', () => {
        beforeEach(() => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            stubs.unbind = sandbox.stub(dialog, 'unbindDOMListeners');
        });

        it('should do nothing if element is already hidden', () => {
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            sandbox.stub(util, 'hideElement');
            dialog.hide();
            expect(util.hideElement).to.not.have.called;
        });

        it('should hide dialog immediately', () => {
            sandbox.stub(dialog, 'toggleFlippedThreadEl');
            dialog.hide();
            expect(dialog.element).to.have.class(constants.CLASS_HIDDEN);
            expect(dialog.toggleFlippedThreadEl).to.be.called;
        });

        it('should hide the mobile dialog if using a mobile browser', () => {
            dialog.isMobile = true;
            sandbox.stub(dialog, 'hideMobileDialog');
            sandbox.stub(dialog, 'toggleFlippedThreadEl');
            dialog.hide();
            expect(dialog.hideMobileDialog).to.be.called;
            expect(dialog.toggleFlippedThreadEl).to.be.called;
            dialog.element = null;
        });
    });

    describe('addAnnotation()', () => {
        beforeEach(() => {
            stubs.addEl = sandbox.stub(dialog, 'addAnnotationElement');
        });

        it('should add annotation to the dialog and deactivate the reply area', () => {
            dialog.addAnnotation(new Annotation({}));
            expect(stubs.addEl).to.be.called;
        });

        it('should hide the create section and show the show section if there are no annotations', () => {
            // Add dialog to DOM
            dialog.annotatedElement.appendChild(dialog.element);

            dialog.addAnnotation(new Annotation({}));
            const createSectionEl = document.querySelector(constants.SECTION_CREATE);
            const showSectionEl = document.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl).to.have.class(constants.CLASS_HIDDEN);
            expect(showSectionEl).to.not.have.class(constants.CLASS_HIDDEN);
        });
    });

    describe('removeAnnotation()', () => {
        it('should remove annotation element and deactivate reply', () => {
            dialog.addAnnotation(
                new Annotation({
                    annotationID: 'someID',
                    text: 'blah',
                    user: {},
                    permissions: {}
                })
            );

            dialog.removeAnnotation('someID');
            const annotationEl = dialog.element.querySelector('[data-annotation-id="someID"]');
            expect(annotationEl).to.be.null;
        });

        it('should focus the reply text area', () => {
            const replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            sandbox.stub(replyTextEl, 'focus');
            dialog.removeAnnotation('someID');
            expect(replyTextEl.focus).to.be.called;
        });
    });

    describe('element()', () => {
        it('should return dialog element', () => {
            expect(dialog.element).to.equal(dialog.element);
        });
    });

    describe('setup()', () => {
        beforeEach(() => {
            const dialogEl = document.createElement('div');
            sandbox.stub(dialog, 'generateDialogEl').returns(dialogEl);
            stubs.bind = sandbox.stub(dialog, 'bindDOMListeners');
            stubs.addSorted = sandbox.stub(dialog, 'addSortedAnnotations');
            stubs.unbind = sandbox.stub(dialog, 'unbindDOMListeners');

            stubs.annotation = new Annotation({
                annotationID: 'someID',
                text: 'blah',
                user: {},
                permissions: {},
                threadNumber: 1
            });

            dialog.isMobile = false;
        });

        it('should set up HTML element, add annotations to the dialog, and bind DOM listeners', () => {
            dialog.setup([stubs.annotation], {});
            expect(dialog.element).to.not.be.null;
            expect(dialog.element.dataset.threadNumber).to.equal('1');
            expect(stubs.bind).to.be.called;
            expect(dialog.threadEl).not.be.null;
        });

        it('should not set thread number if there are no annotations in the thread', () => {
            dialog.setup([], {});
            expect(dialog.element.dataset.threadNumber).to.be.undefined;
        });

        it('should not create dialog element if using a mobile browser', () => {
            dialog.isMobile = true;
            dialog.setup([stubs.annotation, stubs.annotation], {});
            expect(stubs.bind).to.not.be.called;
            expect(stubs.addSorted).to.be.called;
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
            const annotationContainerEl = dialog.dialogEl.querySelector(`.${CLASS_COMMENTS_CONTAINER}`);
            expect(annotationContainerEl.childNodes[0]).to.have.attr('data-annotation-id', '1');
            expect(annotationContainerEl.childNodes[1]).to.have.attr('data-annotation-id', '3');
            expect(annotationContainerEl.childNodes[2]).to.have.attr('data-annotation-id', '2');
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            stubs.replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            stubs.annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            stubs.add = sandbox.stub(dialog.element, 'addEventListener');
            sandbox.stub(stubs.replyTextEl, 'addEventListener');
            sandbox.stub(stubs.annotationTextEl, 'addEventListener');
        });

        it('should bind ALL DOM listeners for touch enabled laptops', () => {
            dialog.hasTouch = true;

            dialog.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseleave', sinon.match.func);
            expect(stubs.add).to.be.calledWith('wheel', sinon.match.func);
            expect(stubs.add).to.be.calledWith('touchstart', dialog.clickHandler);
            expect(stubs.add).to.be.calledWith('touchstart', dialog.stopPropagation);
            expect(stubs.replyTextEl.addEventListener).to.be.calledWith('focus', sinon.match.func);
            expect(stubs.annotationTextEl.addEventListener).to.be.calledWith('focus', sinon.match.func);
        });

        it('should not bind touch events if not on a touch enabled devices', () => {
            dialog.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.add).to.be.calledWith('wheel', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('touchstart', dialog.clickHandler);
            expect(stubs.add).to.not.be.calledWith('touchstart', dialog.stopPropagation);
            dialog.element = null;
        });

        it('should not bind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;
            dialog.showMobileDialog();
            stubs.add = sandbox.stub(dialog.element, 'addEventListener');

            dialog.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('mouseleave', sinon.match.func);
            expect(stubs.add).to.be.calledWith('wheel', sinon.match.func);
            dialog.element = null;
        });
    });

    describe('validateTextArea()', () => {
        it('should do nothing if keyboard event was not in a textarea', () => {
            stubs.textEl = document.createElement('div');
            stubs.textEl.classList.add(constants.CLASS_INVALID_INPUT);
            dialog.validateTextArea({ target: stubs.textEl });
            expect(stubs.textEl).to.have.class(constants.CLASS_INVALID_INPUT);
        });

        it('should do nothing if textarea is blank', () => {
            stubs.textEl = document.createElement('textarea');
            stubs.textEl.classList.add(constants.CLASS_INVALID_INPUT);
            dialog.validateTextArea({ target: stubs.textEl });
            expect(stubs.textEl).to.have.class(constants.CLASS_INVALID_INPUT);
        });

        it('should remove red border around textarea', () => {
            stubs.textEl = document.createElement('textarea');
            stubs.textEl.classList.add(constants.CLASS_INVALID_INPUT);
            stubs.textEl.value = 'words';
            dialog.validateTextArea({ target: stubs.textEl });
            expect(stubs.textEl).to.not.have.class(constants.CLASS_INVALID_INPUT);
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            stubs.replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            stubs.annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            stubs.remove = sandbox.stub(dialog.element, 'removeEventListener');
            sandbox.stub(stubs.replyTextEl, 'removeEventListener');
            sandbox.stub(stubs.annotationTextEl, 'removeEventListener');
        });

        it('should unbind ALL DOM listeners for touch enabled laptops', () => {
            dialog.hasTouch = true;

            dialog.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseleave', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('touchstart', dialog.clickHandler);
            expect(stubs.remove).to.be.calledWith('touchstart', dialog.stopPropagation);
            expect(stubs.remove).to.be.calledWith('wheel', sinon.match.func);
            expect(stubs.replyTextEl.removeEventListener).to.be.calledWith('focus', dialog.validateTextArea);
            expect(stubs.annotationTextEl.removeEventListener).to.be.calledWith('focus', dialog.validateTextArea);
        });

        it('should not bind touch events if not on a touch enabled devices', () => {
            dialog.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('wheel', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('touchstart', dialog.clickHandler);
            expect(stubs.remove).to.not.be.calledWith('touchstart', dialog.stopPropagation);
            dialog.element = null;
        });

        it('should not bind mouseenter/leave events for mobile browsers', () => {
            dialog.isMobile = true;
            dialog.showMobileDialog();
            stubs.remove = sandbox.stub(dialog.element, 'removeEventListener');

            dialog.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('keydown', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseup', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('mouseleave', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('wheel', sinon.match.func);
        });
    });

    describe('keydownHandler()', () => {
        it('should cancel any unsaved annotations when user presses Esc on pending dialog', () => {
            stubs.cancelAnnotation = sandbox.stub(dialog, 'cancelAnnotation');
            dialog.hasAnnotations = false;

            dialog.keydownHandler({
                key: 'U+001B', // esc key
                stopPropagation: () => {}
            });
            expect(stubs.cancelAnnotation).to.be.called;
        });

        it('should hide the dialog when user presses Esc if not creating a new annotation', () => {
            stubs.hide = sandbox.stub(dialog, 'hide');
            dialog.hasAnnotations = true;

            dialog.keydownHandler({
                key: 'U+001B', // esc key
                stopPropagation: () => {}
            });
            expect(stubs.hide).to.be.called;
        });

        it('should activate the reply area when user presses another key inside the reply area', () => {
            stubs.activate = sandbox.stub(dialog, 'activateReply');

            dialog.keydownHandler({
                key: ' ', // space
                target: dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`),
                stopPropagation: () => {}
            });
            expect(stubs.activate).to.be.called;
        });
    });

    describe('stopPropagation()', () => {
        it('should stop propagation on the event', () => {
            const event = {
                stopPropagation: () => {}
            };
            stubs.stop = sandbox.stub(event, 'stopPropagation');

            dialog.stopPropagation(event);
            expect(stubs.stop).to.be.called;
        });
    });

    describe('mouseenterHandler()', () => {
        beforeEach(() => {
            stubs.show = sandbox.stub(util, 'showElement');
            stubs.activate = sandbox.stub(dialog, 'activateReply');
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
        });

        it('should show the element only if the element is currently hidden', () => {
            dialog.element.classList.add(constants.CLASS_HIDDEN);

            dialog.mouseenterHandler();
            expect(util.showElement).to.be.called;
            expect(stubs.activate).to.be.called;
        });

        it('should do nothing if the element is already shown', () => {
            dialog.mouseenterHandler();
            expect(util.showElement).to.not.be.called;
            expect(stubs.activate).to.be.called;
        });

        it('should emit \'annotationcommentpending\' when user hovers back into a dialog that has a pending comment', () => {
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            const commentsTextArea = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            commentsTextArea.textContent = 'bleh';

            dialog.mouseenterHandler();
            expect(stubs.show).to.be.called;
            expect(stubs.emit).to.be.calledWith('annotationcommentpending');
            expect(stubs.activate).to.be.called;
        });

        it('should not emit \'annotationcommentpending\' in read-only mode', () => {
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            const commentsTextArea = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            commentsTextArea.parentNode.removeChild(commentsTextArea);

            dialog.mouseenterHandler();
            expect(stubs.show).to.be.called;
            expect(stubs.emit).to.not.be.calledWith('annotationcommentpending');
            expect(stubs.activate).to.be.called;
        });
    });

    describe('mouseleaveHandler()', () => {
        beforeEach(() => {
            stubs.hide = sandbox.stub(dialog, 'hide');
            stubs.annotation = new Annotation({
                annotationID: 'someID',
                text: 'blah',
                user: {},
                permissions: {}
            });
        });

        it('should not do anything if there are no annotations in the dialog', () => {
            dialog.mouseleaveHandler({});
            expect(stubs.hide).to.not.be.called;
        });

        it('should not do anything if the mouse is still in the dialog', () => {
            dialog.addAnnotation(stubs.annotation);
            sandbox.stub(util, 'isInDialog').returns(true);
            dialog.mouseleaveHandler({});
            expect(stubs.hide).to.not.be.called;
        });

        it('should hide dialog if there are annotations in the dialog', () => {
            dialog.addAnnotation(stubs.annotation);
            dialog.mouseleaveHandler({});
            expect(stubs.hide).to.be.called;
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
            sandbox.stub(annotationEl, 'querySelectorAll').returns([btn, btn]);

            const wrongEl = document.createElement('div');
            wrongEl.setAttribute('data-annotation-id', 'invalid');
            sandbox.stub(wrongEl, 'querySelectorAll');
            dialog.element.appendChild(wrongEl);

            dialog.enable('123');
            expect(annotationEl.querySelectorAll).to.be.called;
            expect(btn).to.not.have.class(constants.CLASS_DISABLED);
            expect(wrongEl.querySelectorAll).to.not.be.called;
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
            sandbox.stub(annotationEl, 'querySelectorAll').returns([btn, btn]);

            const wrongEl = document.createElement('div');
            wrongEl.setAttribute('data-annotation-id', 'invalid');
            sandbox.stub(wrongEl, 'querySelectorAll');
            dialog.element.appendChild(wrongEl);

            dialog.disable('123');
            expect(annotationEl.querySelectorAll).to.be.called;
            expect(btn).to.have.class(constants.CLASS_DISABLED);
            expect(wrongEl.querySelectorAll).to.not.be.called;
        });
    });

    describe('clickHandler()', () => {
        beforeEach(() => {
            stubs.event = {
                stopPropagation: () => {},
                preventDefault: () => {},
                target: document.createElement('div')
            };
            stubs.post = sandbox.stub(dialog, 'postAnnotation');
            stubs.cancel = sandbox.stub(dialog, 'cancelAnnotation');
            stubs.deactivate = sandbox.stub(dialog, 'deactivateReply');
            stubs.activate = sandbox.stub(dialog, 'activateReply');
            stubs.findClosest = sandbox.stub(util, 'findClosestDataType');
            stubs.showDelete = sandbox.stub(dialog, 'showDeleteConfirmation');
            stubs.hideDelete = sandbox.stub(dialog, 'hideDeleteConfirmation');
            stubs.delete = sandbox.stub(dialog, 'deleteAnnotation');
            stubs.reply = sandbox.stub(dialog, 'postReply');
            stubs.hideMobile = sandbox.stub(dialog, 'hideMobileDialog');

            dialog.element.classList.remove(constants.CLASS_HIDDEN);
        });

        it('should post annotation when post annotation button is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_POST);

            dialog.clickHandler(stubs.event);
            expect(stubs.post).to.be.called;
        });

        it('should cancel annotation when cancel annotation button is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_CANCEL);
            dialog.clickHandler(stubs.event);
            expect(stubs.cancel).to.be.called;
        });

        it('should cancel annotation when mobile dialog close button is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_MOBILE_CLOSE);
            dialog.clickHandler(stubs.event);
            expect(stubs.cancel).to.be.called;
        });

        it('should activate reply area when textarea is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_REPLY_TEXTAREA);

            dialog.clickHandler(stubs.event);
            expect(stubs.activate).to.be.called;
        });

        it('should deactivate reply area when cancel reply button is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_CANCEL_REPLY);

            dialog.clickHandler(stubs.event);
            expect(stubs.deactivate).to.be.calledWith(true);
        });

        it('should post reply when post reply button is clicked', () => {
            stubs.findClosest.returns(constants.DATA_TYPE_POST_REPLY);

            dialog.clickHandler(stubs.event);
            expect(stubs.reply).to.be.called;
        });

        it('should show delete confirmation when delete button is clicked', () => {
            stubs.findClosest.onFirstCall().returns(constants.DATA_TYPE_DELETE);
            stubs.findClosest.onSecondCall().returns('someID');

            dialog.clickHandler(stubs.event);
            expect(stubs.showDelete).to.be.calledWith('someID');
        });

        it('should cancel deletion when cancel delete button is clicked', () => {
            stubs.findClosest.onFirstCall().returns(constants.DATA_TYPE_CANCEL_DELETE);
            stubs.findClosest.onSecondCall().returns('someID');

            dialog.clickHandler(stubs.event);
            expect(stubs.hideDelete).to.be.calledWith('someID');
        });

        it('should confirm deletion when confirm delete button is clicked', () => {
            stubs.findClosest.onFirstCall().returns(constants.DATA_TYPE_CONFIRM_DELETE);
            stubs.findClosest.onSecondCall().returns('someID');

            dialog.clickHandler(stubs.event);
            expect(stubs.delete).to.be.calledWith('someID');
        });

        it('should do nothing if dataType does not match any button in the annotation dialog', () => {
            stubs.findClosest.returns(null);

            dialog.clickHandler(stubs.event);
            expect(stubs.post).to.not.be.called;
            expect(stubs.reply).to.not.be.called;
            expect(stubs.cancel).to.not.be.called;
            expect(stubs.deactivate).to.not.be.called;
            expect(stubs.activate).to.not.be.called;
            expect(stubs.reply).to.not.be.called;
            expect(stubs.showDelete).to.not.be.called;
            expect(stubs.hideDelete).to.not.be.called;
            expect(stubs.delete).to.not.be.called;
        });
    });

    describe('addAnnotationElement()', () => {
        it('should add an annotation comment if text is present', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is awesome!',
                    user: {},
                    permissions: {}
                })
            );
            const annotationComment = document.querySelector(constants.SELECTOR_ANNOTATION_COMMENT_TEXT);
            expect(annotationComment).to.contain.html('the preview sdk is awesome!');
        });

        it('should display the posting message if the user id is 0', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is awesome!',
                    user: { id: 0 },
                    permissions: {}
                })
            );
            const username = document.querySelector(constants.SELECTOR_USER_NAME);
            expect(username).to.contain.html(dialog.localized.posting);
        });

        it('should display user name if the user id is not 0', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is awesome!',
                    user: { id: 1, name: 'user' },
                    permissions: {}
                })
            );
            const username = document.querySelector(constants.SELECTOR_USER_NAME);
            expect(username).to.contain.html('user');
        });

        it('should not the delete icon if the user does not have delete permissions', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: false }
                })
            );
            const deleteButton = document.querySelector(`.${CLASS_BUTTON_DELETE_COMMENT}`);
            expect(deleteButton).to.be.null;
        });

        it('should not add the delete icon if the delete permission is not specified', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: {}
                })
            );
            const deleteButton = document.querySelector(`.${CLASS_BUTTON_DELETE_COMMENT}`);
            expect(deleteButton).to.be.null;
        });

        it('should make delete icon visible if the user has delete permission', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const deleteButton = document.querySelector(`.${CLASS_BUTTON_DELETE_COMMENT}`);
            expect(deleteButton).to.not.have.class(constants.CLASS_HIDDEN);
        });

        it('should hide the delete confirmation UI by default', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const deleteConfirmation = document.querySelector(SELECTOR_DELETE_CONFIRMATION);
            expect(deleteConfirmation).to.have.class(constants.CLASS_HIDDEN);
        });

        it('should correctly format the date and time in a different locale', () => {
            const date = new Date();
            stubs.locale = sandbox.stub(Date.prototype, 'toLocaleString');
            dialog.locale = 'en-GB';

            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true },
                    created: date
                })
            );
            expect(stubs.locale).to.be.calledWith('en-GB');
        });

        it('should add a <br> for each newline', () => {
            const withBreaks = `


            yay, three breaks!`;

            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: withBreaks,
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const breaks = document.querySelectorAll(`${constants.SELECTOR_ANNOTATION_COMMENT_TEXT} br`);
            expect(breaks.length === 3).to.be.true;
        });

        it('should respect symbols added to the text', () => {
            const text = 'I can add symbols &&&';
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text,
                    user: {},
                    permissions: {}
                })
            );
            const annotationComment = document.querySelector(constants.SELECTOR_ANNOTATION_COMMENT_TEXT);
            expect(annotationComment.textContent).to.equal(text);
            expect(annotationComment.textContent.includes('&amp;')).to.be.false;
        });
    });

    describe('postAnnotation()', () => {
        it('should not post an annotation to the dialog if it has no text', () => {
            const annotationTextEl = dialog.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            dialog.postAnnotation();
            expect(stubs.emit).to.not.be.called;
            expect(annotationTextEl).to.have.class(CLASS_INVALID_INPUT);
        });

        it('should post an annotation to the dialog if it has text', () => {
            document.querySelector('textarea').innerHTML += 'the preview SDK is great!';

            dialog.postAnnotation();
            expect(stubs.emit).to.be.calledWith('annotationcreate', { text: 'the preview SDK is great!' });
        });

        it('should clear the annotation text element after posting', () => {
            const annotationTextEl = document.querySelector('textarea');
            annotationTextEl.innerHTML += 'the preview SDK is great!';

            dialog.postAnnotation();
            expect(annotationTextEl).to.have.value('');
        });
    });

    describe('cancelAnnotation()', () => {
        it('should emit the annotationcancel message', () => {
            dialog.cancelAnnotation();
            expect(stubs.emit).to.be.calledWith('annotationcancel');
        });
    });

    describe('activateReply()', () => {
        it('should do nothing if the dialogEl does not exist', () => {
            dialog.dialogEl = null;
            sandbox.stub(util, 'showElement');
            dialog.activateReply();
            expect(util.showElement).to.not.be.called;
        });

        it('should do nothing if reply textarea is already active', () => {
            const replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            replyTextEl.classList.add('bp-is-active');
            sandbox.stub(util, 'showElement');

            dialog.activateReply();
            expect(util.showElement).to.not.be.called;
        });

        it('should do nothing if reply text area does not exist', () => {
            const replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            replyTextEl.parentNode.removeChild(replyTextEl);
            sandbox.stub(util, 'showElement');

            dialog.activateReply();
            expect(util.showElement).to.not.be.called;
        });

        it('should show the correct UI when the reply textarea is activated', () => {
            document.querySelector('textarea').innerHTML += 'the preview SDK is great!';
            dialog.addAnnotationElement({
                annotationID: 1,
                text: 'the preview sdk is amazing!',
                user: { id: 1, name: 'user' },
                permissions: { can_delete: true }
            });
            const replyTextEl = document.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            const buttonContainer = replyTextEl.parentNode.querySelector(constants.SELECTOR_BUTTON_CONTAINER);

            dialog.activateReply();
            expect(replyTextEl).to.have.class(constants.CLASS_ACTIVE);
            expect(buttonContainer).to.not.have.class(constants.CLASS_HIDDEN);
        });
    });

    describe('deactivateReply()', () => {
        it('should do nothing if element does not exist', () => {
            dialog.dialogEl = null;
            sandbox.stub(util, 'resetTextarea');

            dialog.deactivateReply();
            expect(util.resetTextarea).to.not.be.called;
        });

        it('should do nothing if reply text area does not exist', () => {
            const replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_CONTAINER}`);
            replyTextEl.parentNode.removeChild(replyTextEl);
            sandbox.stub(util, 'showElement');

            dialog.deactivateReply();
            expect(util.showElement).to.not.be.called;
        });

        it('should show the correct UI when the reply textarea is deactivated', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const replyTextEl = document.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            const buttonContainer = replyTextEl.parentNode.querySelector(constants.SELECTOR_BUTTON_CONTAINER);

            dialog.deactivateReply();
            expect(replyTextEl).to.not.have.class(constants.CLASS_ACTIVE);
            expect(buttonContainer).to.have.class(constants.CLASS_HIDDEN);
        });
    });

    describe('postReply()', () => {
        it('should not post reply to the dialog if it has no text', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            dialog.activateReply();
            const replyTextEl = dialog.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);

            dialog.postReply();
            expect(stubs.emit).to.not.be.called;
            expect(replyTextEl).to.have.class(CLASS_INVALID_INPUT);
        });

        it('should post a reply to the dialog if it has text', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const replyTextEl = document.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            dialog.activateReply();
            replyTextEl.innerHTML += 'the preview SDK is great!';

            dialog.postReply();
            expect(stubs.emit).to.be.calledWith('annotationcreate', { text: 'the preview SDK is great!' });
        });

        it('should clear the reply text element after posting', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const replyTextEl = document.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            dialog.activateReply();
            replyTextEl.innerHTML += 'the preview SDK is great!';
            sandbox.stub(replyTextEl, 'focus');

            dialog.postReply();
            expect(replyTextEl).to.have.value('');
            expect(replyTextEl.focus).to.be.called;
        });
    });

    describe('showDeleteConfirmation()', () => {
        it('should show the correct UI when a user clicks on delete', () => {
            dialog.addAnnotationElement(
                new Annotation({
                    annotationID: 1,
                    text: 'the preview sdk is amazing!',
                    user: { id: 1, name: 'user' },
                    permissions: { can_delete: true }
                })
            );
            const showElementStub = sandbox.stub(util, 'showElement');

            dialog.showDeleteConfirmation(1);
            expect(showElementStub).to.be.called;
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
            const hideElementStub = sandbox.stub(util, 'hideElement');
            dialog.showDeleteConfirmation(1);

            dialog.hideDeleteConfirmation(1);
            expect(hideElementStub).to.be.called;
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
            expect(stubs.emit).to.be.calledWith('annotationdelete', { annotationID: 1 });
        });
    });

    describe('generateDialogEl', () => {
        it('should generate a blank annotations dialog element', () => {
            const dialogEl = dialog.generateDialogEl(0);
            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl).to.not.have.class(constants.CLASS_HIDDEN);
            expect(showSectionEl).to.have.class(constants.CLASS_HIDDEN);
        });

        it('should generate an annotations dialog element with annotations', () => {
            const dialogEl = dialog.generateDialogEl(1);
            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl).to.have.class(constants.CLASS_HIDDEN);
            expect(showSectionEl).to.not.have.class(constants.CLASS_HIDDEN);
        });

        it('should not add the create section nor the reply container in read-only mode', () => {
            dialog.canAnnotate = false;
            const dialogEl = dialog.generateDialogEl(1);

            const createSectionEl = dialogEl.querySelector(constants.SECTION_CREATE);
            const replyContainerEl = dialogEl.querySelector(`.${CLASS_REPLY_CONTAINER}`);
            const showSectionEl = dialogEl.querySelector(constants.SECTION_SHOW);
            expect(createSectionEl).to.be.null;
            expect(replyContainerEl).to.be.null;
            expect(showSectionEl).to.not.have.class(constants.CLASS_HIDDEN);
        });
    });

    describe('flipDialog()', () => {
        const containerHeight = 5;

        beforeEach(() => {
            sandbox.stub(dialog.element, 'querySelector').returns(document.createElement('div'));
            sandbox.stub(dialog, 'fitDialogHeightInPage');
            sandbox.stub(dialog, 'toggleFlippedThreadEl');
        });

        afterEach(() => {
            dialog.element = null;
        });

        it('should keep the dialog below the annotation icon if the annotation is in the top half of the viewport', () => {
            const { top, bottom } = dialog.flipDialog(2, containerHeight);
            expect(dialog.element).to.not.have.class(CLASS_FLIPPED_DIALOG);
            expect(top).to.not.equal('');
            expect(bottom).to.equal('');
            expect(dialog.fitDialogHeightInPage).to.be.called;
            expect(dialog.toggleFlippedThreadEl).to.be.called;
        });

        it('should flip the dialog above the annotation icon if the annotation is in the lower half of the viewport', () => {
            const { top, bottom } = dialog.flipDialog(4, containerHeight);
            expect(dialog.element).to.have.class(CLASS_FLIPPED_DIALOG);
            expect(top).to.equal('');
            expect(bottom).to.not.equal('');
        });
    });

    describe('toggleFlippedThreadEl()', () => {
        beforeEach(() => {
            dialog.element.classList.remove(constants.CLASS_HIDDEN);
            dialog.threadEl = document.createElement('div');
        });

        it('should do nothing if the dialog is not flipped', () => {
            stubs.add = sandbox.stub(dialog.threadEl.classList, 'add');
            stubs.remove = sandbox.stub(dialog.threadEl.classList, 'remove');
            dialog.toggleFlippedThreadEl();
            expect(stubs.add).to.not.be.called;
            expect(stubs.remove).to.not.be.called;
        });

        it('should reset thread icon if dialog is flipped and hidden', () => {
            dialog.element.classList.add(CLASS_FLIPPED_DIALOG);
            stubs.add = sandbox.stub(dialog.threadEl.classList, 'add');
            stubs.remove = sandbox.stub(dialog.threadEl.classList, 'remove');
            dialog.toggleFlippedThreadEl();
            expect(stubs.add).to.be.called;
            expect(stubs.remove).to.not.be.called;
        });

        it('should flip thread icon if dialog is flipped and not hidden', () => {
            dialog.element.classList.add(CLASS_FLIPPED_DIALOG);
            dialog.element.classList.add(constants.CLASS_HIDDEN);
            stubs.add = sandbox.stub(dialog.threadEl.classList, 'add');
            stubs.remove = sandbox.stub(dialog.threadEl.classList, 'remove');
            dialog.toggleFlippedThreadEl();
            expect(stubs.add).to.not.be.called;
            expect(stubs.remove).to.be.called;
        });
    });

    describe('fitDialogHeightInPage()', () => {
        it('should allow scrolling on annotations dialog if file is a powerpoint', () => {
            dialog.dialogEl = {
                style: {},
                querySelector: sandbox.stub().returns(null)
            };
            dialog.container = { clientHeight: 100 };
            dialog.fitDialogHeightInPage();
            expect(dialog.dialogEl.style.maxHeight).to.equal('20px');
        });

        it('should allow scrolling on annotations dialog if file is a powerpoint', () => {
            const commentsEl = document.createElement('div');
            dialog.dialogEl = {
                style: {},
                querySelector: sandbox.stub().returns(commentsEl)
            };
            dialog.container = { clientHeight: 100 };
            dialog.fitDialogHeightInPage();
            expect(dialog.dialogEl.style.maxHeight).to.equal('20px');
            expect(commentsEl.style.maxHeight).to.equal('20px');
        });
    });
});
