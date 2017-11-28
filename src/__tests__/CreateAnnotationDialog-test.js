/* eslint-disable no-unused-expressions */
import CreateAnnotationDialog from '../CreateAnnotationDialog';
import {
    CLASS_ADD_HIGHLIGHT_BTN,
    CLASS_ADD_HIGHLIGHT_COMMENT_BTN,
    CLASS_MOBILE_CREATE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_CARET,
    CLASS_HIDDEN,
    CREATE_EVENT
} from '../constants';
import CommentBox from '../CommentBox';
import * as util from '../util';

const CLASS_CREATE_DIALOG = 'bp-create-annotation-dialog';

const sandbox = sinon.sandbox.create();
let dialog;
let parentEl;
const localized = {
    highlightToggle: 'highlight toggle',
    highlightComment: 'highlight comment'
};
let stubs = {};

describe('CreateAnnotationDialog', () => {
    beforeEach(() => {
        const parentEl = document.createElement('div');
        parentEl.classList.add('bp-create-dialog-container');
        dialog = new CreateAnnotationDialog(parentEl, {
            isMobile: true,
            localized
        });

        dialog.commentBox = {
            containerEl: document.createElement('div'),
            hide: () => {},
            show: () => {},
            focus: () => {},
            removeListener: () => {},
            destroy: () => {},
            clear: () => {}
        };
        stubs.boxMock = sandbox.mock(dialog.commentBox);
    });

    afterEach(() => {
        dialog.destroy();
        dialog = null;
        parentEl = null;
    });

    describe('contructor()', () => {
        it('should take config falsey value to disable highlights and comments, when passed in', () => {
            expect(dialog.parentEl).to.not.be.undefined;
            expect(dialog.isMobile).to.be.truthy;
            expect(dialog.hasTouch).to.be.falsy;
            expect(dialog.localized).to.equal(localized);
            expect(dialog.isVisible).to.be.falsy;
        });
    });

    describe('setParentEl()', () => {
        it('should assign the new parent reference', () => {
            const newParent = document.createElement('span');
            dialog.setParentEl(newParent);
            expect(dialog.parentEl).to.not.deep.equal(parentEl);
            expect(dialog.parentEl).to.deep.equal(newParent);
        });
    });

    describe('setPosition()', () => {
        let update;
        beforeEach(() => {
            update = sandbox.stub(dialog, 'updatePosition');
        });

        it('should set the x and y coordinates to the passed in values', () => {
            const x = 5;
            const y = 6;
            dialog.setPosition(x, y);
            expect(dialog.position.x).to.equal(x);
            expect(dialog.position.y).to.equal(y);
        });

        it('should invoke updatePosition()', () => {
            dialog.setPosition(0, 0);
            expect(update).to.be.called;
        });
    });

    describe('show()', () => {
        it('should invoke createElement() if no UI element has been created', () => {
            const create = sandbox.spy(dialog, 'createElement');
            dialog.show();
            expect(create.called).to.be.true;
        });

        it('should set the parentEl to a new reference, via setParentEl(), if a new one is supplied', () => {
            const set = sandbox.stub(dialog, 'setParentEl');
            const newParent = document.createElement('span');
            dialog.show(newParent);
            expect(set).to.be.calledWith(newParent);
        });

        it('should invoke setButtonVisibility() to show the highlight buttons', () => {
            const setVis = sandbox.stub(dialog, 'setButtonVisibility');
            dialog.show();
            expect(setVis).to.be.called;
        });

        it('should remove the hidden class from the UI element', () => {
            const emit = sandbox.stub(dialog, 'emit');
            dialog.show();
            expect(dialog.containerEl.classList.contains(CLASS_HIDDEN)).to.be.false;
            expect(emit).to.be.calledWith(CREATE_EVENT.init);
        });
    });

    describe('showCommentBox()', () => {
        it('should show and focus comment box', () => {
            stubs.boxMock.expects('show');
            stubs.boxMock.expects('focus');
            dialog.showCommentBox();
        });
    });

    describe('hide()', () => {
        beforeEach(() => {
            dialog.show();
        });

        it('should do nothing if there is no UI element', () => {
            dialog.containerEl = null;
            const hideComment = sandbox.stub(dialog.commentBox, 'hide');
            dialog.hide();
            expect(hideComment).to.not.be.called;
        });

        it('should add the hidden class to the ui element', () => {
            dialog.hide();
            expect(dialog.containerEl.classList.contains(CLASS_HIDDEN)).to.be.true;
        });

        it('should hide the comment box', () => {
            const hideComment = sandbox.stub(dialog.commentBox, 'hide');
            dialog.hide();
            expect(hideComment).to.be.called;
        });

        it('should clear the comment box', () => {
            const clearComment = sandbox.stub(dialog.commentBox, 'clear');
            dialog.hide();
            expect(clearComment).to.be.called;
        });

        it('should do nothing with the comment box if it does not exist', () => {
            const clearComment = sandbox.stub(dialog.commentBox, 'clear');
            dialog.commentBox = null;
            dialog.hide();
            expect(clearComment).to.not.be.called;
        });
    });

    describe('destroy()', () => {
        beforeEach(() => {
            sandbox.stub(dialog, 'setupCommentBox').returns(dialog.commentBox);
            dialog.show();
        });

        it('should do nothing if no ui has been created', () => {
            dialog.containerEl = null;
            const hide = sandbox.stub(dialog, 'hide');
            dialog.destroy();
            expect(hide).to.not.be.called;
        });

        it('should remove events that are bound to stopPropagation()', () => {
            const remove = sandbox.stub(dialog.containerEl, 'removeEventListener');
            dialog.destroy();
            expect(remove).to.be.calledWith('click');
            expect(remove).to.be.calledWith('mouseup');
            expect(remove).to.be.calledWith('dblclick');
        });

        it('should remove "Post" event listener from the comment box', () => {
            const remove = sandbox.stub(dialog.commentBox, 'removeListener');
            dialog.destroy();
            expect(remove).to.be.calledWith(CommentBox.CommentEvents.post);
        });

        it('should remove "Cancel" event listener from the comment box', () => {
            const remove = sandbox.stub(dialog.commentBox, 'removeListener');
            dialog.destroy();
            expect(remove).to.be.calledWith(CommentBox.CommentEvents.cancel);
        });

        it('should remove the ui element from the dom', () => {
            const remove = sandbox.stub(dialog.containerEl, 'remove');
            dialog.destroy();
            expect(remove).to.be.called;
        });

        it('should destroy the comment box', () => {
            const destroy = sandbox.stub(dialog.commentBox, 'destroy');
            dialog.destroy();
            expect(destroy).to.be.called;
        });

        it('should remove out all touch events, if touch enabled', () => {
            dialog.destroy();

            dialog.hasTouch = true;
            dialog.isMobile = true;
            dialog.show(document.createElement('div'));

            const stubs = [
                {
                    stub: sandbox.stub(dialog.containerEl, 'removeEventListener'),
                    args: ['touchend', dialog.stopPropagation]
                }
            ];

            dialog.destroy();

            stubs.forEach((stub) => {
                expect(stub.stub).to.be.calledWith(...stub.args);
            });
        });
    });

    describe('updatePosition()', () => {
        beforeEach(() => {
            dialog.show();
            dialog.isMobile = false;
        });

        it('should update the top of the ui element', () => {
            const y = 50;
            dialog.position.y = y;
            dialog.updatePosition();
            expect(dialog.containerEl.style.top).to.equal(`${y + 5}px`);
        });

        it('should update the left of the ui element, to center it', () => {
            const width = dialog.containerEl.clientWidth;
            const x = 50;
            dialog.position.x = x;
            dialog.updatePosition();
            expect(dialog.containerEl.style.left).to.equal(`${x - 1 - width / 2}px`);
        });

        it('should do nothing if user is on a mobile device', () => {
            const y = 50;
            dialog.position.y = y;
            dialog.isMobile = true;
            dialog.updatePosition();
            expect(dialog.containerEl.style.top).to.not.equal(`${y + 5}px`);
        });
    });

    describe('onCommentPost()', () => {
        beforeEach(() => {
            dialog.show();
        });

        it('should invoke the "post" event with the string provided', () => {
            const emit = sandbox.stub(dialog, 'emit');
            const text = 'some text';
            dialog.onCommentPost(text);
            expect(emit).to.be.calledWith(CREATE_EVENT.post, text);
        });

        it('should invoke clear() on the comment box', () => {
            const clear = sandbox.stub(dialog.commentBox, 'clear');
            dialog.onCommentPost('A message');
            expect(clear).to.be.called;
        });

        it('should invoke blur() on the comment box', () => {
            const blur = sandbox.stub(dialog.commentBox, 'blur');
            dialog.onCommentPost('A message');
            expect(blur).to.be.called;
        });
    });

    describe('onCommentCancel()', () => {
        beforeEach(() => {
            dialog.show();
        });

        it('should hide the comment box', () => {
            const hide = sandbox.stub(dialog.commentBox, 'hide');
            dialog.onCommentCancel();
            expect(hide).to.be.called;
        });

        it('should show the highlight buttons', () => {
            const setVis = sandbox.stub(dialog, 'setButtonVisibility');
            dialog.onCommentCancel();
            expect(setVis).to.be.calledWith(true);
        });

        it('should update the position of the dialog', () => {
            const update = sandbox.stub(dialog, 'updatePosition');
            dialog.onCommentCancel();
            expect(update).to.be.called;
        });
    });

    describe('setButtonVisibility()', () => {
        it('should show the buttons if given "true"', () => {
            sandbox.stub(util, 'showElement');
            dialog.setButtonVisibility(true);
            expect(util.showElement).to.be.calledWith(dialog.buttonsEl);
        });

        it('should hide the buttons if given "false"', () => {
            sandbox.stub(util, 'hideElement');
            dialog.setButtonVisibility(false);
            expect(util.hideElement).to.be.calledWith(dialog.buttonsEl);
        });
    });

    describe('stopPropagation()', () => {
        it('should invoke stopPropagation() on the provided event', () => {
            const event = {
                stopPropagation: sandbox.stub()
            };
            dialog.stopPropagation(event);
            expect(event.stopPropagation).to.be.called;
        });
    });

    describe('setupCommentBox', () => {
        it('should create a comment box', () => {
            dialog.commentBox = undefined;
            const box = dialog.setupCommentBox(document.createElement('div'));
            expect(box).to.exist;
        });
    });

    describe('createElement()', () => {
        it('should create a div with the proper create highlight class', () => {
            dialog.createElement();
            expect(dialog.containerEl.nodeName).to.equal('DIV');
            expect(dialog.containerEl.classList.contains(CLASS_MOBILE_CREATE_ANNOTATION_DIALOG)).to.be.true;
            expect(dialog.containerEl.classList.contains(CLASS_ANNOTATION_DIALOG)).to.be.true;
        });

        it('should create a comment box', () => {
            sandbox.stub(dialog, 'setupCommentBox').returns(dialog.commentBox);
            dialog.createElement();
            expect(dialog.setupCommentBox).to.be.calledWith(dialog.containerEl);
        });
    });
});
