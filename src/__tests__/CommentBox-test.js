/* eslint-disable no-unused-expressions */
import CommentBox from '../CommentBox';
import * as util from '../util';
import {
    CLASS_HIDDEN,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_POST,
    CLASS_ANNOTATION_BUTTON_CANCEL,
    CLASS_ANNOTATION_BUTTON_POST,
    CLASS_ANNOTATION_TEXTAREA,
    CLASS_INVALID_INPUT
} from '../constants';

describe('CommentBox', () => {
    let commentBox;
    let parentEl;

    beforeEach(() => {
        parentEl = document.createElement('span');
        commentBox = new CommentBox(parentEl, {
            localized: {
                cancelButton: 'cancel'
            }
        });
    });

    afterEach(() => {
        commentBox.destroy();
        commentBox = null;
        parentEl = null;
    });

    describe('constructor()', () => {
        let tempCommentBox;
        const localized = {
            cancelButton: 'cancel',
            postButton: 'post',
            addCommentPlaceholder: 'placeholder'
        };

        beforeEach(() => {
            tempCommentBox = new CommentBox(parentEl, { localized });
        });

        afterEach(() => {
            tempCommentBox.destroy();
            tempCommentBox = null;
        });

        it('should assign the parentEl to the container passed in', () => {
            expect(tempCommentBox.parentEl).toStrictEqual(parentEl);
        });

        it('should assign cancelText to the string passed in the config', () => {
            expect(tempCommentBox.cancelText).toEqual(localized.cancelButton);
        });

        it('should assign postText to the string passed in the config', () => {
            expect(tempCommentBox.postText).toEqual(localized.postButton);
        });

        it('should assign placeholderText to the string passed in the config', () => {
            expect(tempCommentBox.placeholderText).toEqual(localized.addCommentPlaceholder);
        });
    });

    describe('focus()', () => {
        beforeEach(() => {
            commentBox.textAreaEl = document.createElement('textarea');
            commentBox.textAreaEl.focus = jest.fn();
        });

        it('should focus on the text area contained by the comment box', () => {
            commentBox.focus();
            expect(commentBox.textAreaEl.focus).toBeCalled();
        });
    });

    describe('clear()', () => {
        it('should overwrite the text area\'s value with an empty string', () => {
            commentBox.textAreaEl = document.createElement('textarea');
            commentBox.textAreaEl.value = 'yay';

            commentBox.clear();
            expect(commentBox.textAreaEl.value).toEqual('');
        });
    });

    describe('hide()', () => {
        it('should do nothing if the comment box HTML doesn\'t exist', () => {
            util.hideElement = jest.fn();
            commentBox.containerEl = null;
            commentBox.hide();
            expect(util.hideElement).not.toBeCalled();
        });

        it('should add the hidden class to the comment box element', () => {
            util.hideElement = jest.fn();
            commentBox.containerEl = document.createElement('div');
            commentBox.blur = jest.fn();
            commentBox.hide();
            expect(util.hideElement).toBeCalled();
            expect(commentBox.blur).toBeCalled();
        });
    });

    describe('show()', () => {
        it('should invoke createComment box, if UI has not been created', () => {
            commentBox.containerEl = null;

            commentBox.createCommentBox = jest.fn().mockReturnValue(document.createElement('div'));
            commentBox.parentEl = document.createElement('div');
            util.focusTextArea = jest.fn();
            util.showElement = jest.fn();

            commentBox.show();
            expect(commentBox.createCommentBox).toBeCalled();
            expect(util.showElement).toBeCalled();

            // Nullify to prevent fail during destroy
            commentBox.containerEl = null;
        });

        it('should remove the hidden class from the container', () => {
            commentBox.show();
            expect(commentBox.containerEl.classList.contains(CLASS_HIDDEN)).toBeFalsy();
            expect(util.focusTextArea).toBeCalledWith(commentBox.textAreaEl);
        });
    });

    describe('destroy()', () => {
        beforeEach(() => {
            commentBox.containerEl = document.createElement('div');

            commentBox.cancelEl = document.createElement('div');
            commentBox.cancelEl.classList.add(CLASS_ANNOTATION_BUTTON_CANCEL);
            commentBox.cancelEl.removeEventListener = jest.fn();

            commentBox.postEl = document.createElement('div');
            commentBox.postEl.classList.add(CLASS_ANNOTATION_BUTTON_POST);
            commentBox.postEl.removeEventListener = jest.fn();

            commentBox.textAreaEl = document.createElement('div');
            commentBox.textAreaEl.classList.add(CLASS_ANNOTATION_TEXTAREA);
            commentBox.textAreaEl.removeEventListener = jest.fn();
        });

        it('should do nothing if it\'s UI has not been created', () => {
            commentBox.containerEl = undefined;
            const unchanged = 'not even the right kind of data';
            commentBox.parentEl = unchanged;
            commentBox.destroy();
            expect(commentBox.parentEl).toEqual(unchanged);
        });

        it('should remove event listeners', () => {
            commentBox.destroy();
            expect(commentBox.cancelEl.removeEventListener).toBeCalled();
            expect(commentBox.postEl.removeEventListener).toBeCalled();
            expect(commentBox.textAreaEl.removeEventListener).toBeCalled();
        });
    });

    describe('createHTML()', () => {
        let el;
        beforeEach(() => {
            el = commentBox.createHTML();
        });

        it('should create and return a section element with ba-create-highlight-comment class on it', () => {
            expect(el.nodeName).toEqual('SECTION');
            expect(el.classList.contains('ba-create-comment')).toBeTruthy();
        });

        it('should create a text area with the provided placeholder text', () => {
            expect(el.querySelector('textarea')).not.toBeUndefined();
        });

        it('should create a cancel button with the provided cancel text', () => {
            expect(el.querySelector(SELECTOR_ANNOTATION_BUTTON_CANCEL)).not.toBeUndefined();
        });

        it('should create a post button with the provided text', () => {
            expect(el.querySelector(SELECTOR_ANNOTATION_BUTTON_POST)).not.toBeUndefined();
        });
    });

    describe('onCancel()', () => {
        beforeEach(() => {
            commentBox.preventDefaultAndPropagation = jest.fn();
            commentBox.emit = jest.fn();
            commentBox.clear = jest.fn();
        });

        it('should invoke clear()', () => {
            commentBox.onCancel({ preventDefault: jest.fn() });
            expect(commentBox.clear).toBeCalled();
        });

        it('should emit a cancel event', () => {
            commentBox.onCancel({ preventDefault: jest.fn() });
            expect(commentBox.emit).toBeCalledWith(CommentBox.CommentEvents.cancel);
        });
    });

    describe('onPost()', () => {
        beforeEach(() => {
            commentBox.textAreaEl = document.createElement('textarea');
            commentBox.preventDefaultAndPropagation = jest.fn();
            commentBox.emit = jest.fn();
            commentBox.clear = jest.fn();
        });

        it('should invalidate textarea and do nothing if textarea is blank', () => {
            const text = '';
            commentBox.onPost({ preventDefault: jest.fn() });
            expect(commentBox.emit).not.toBeCalledWith(CommentBox.CommentEvents.post, text);
            expect(commentBox.textAreaEl.classList).toContain(CLASS_INVALID_INPUT);
        });

        it('should emit a post event with the value of the text box', () => {
            const text = 'a comment';
            commentBox.textAreaEl.value = text;
            commentBox.onPost({ preventDefault: jest.fn() });
            expect(commentBox.emit).toBeCalledWith(CommentBox.CommentEvents.post, text);
        });

        it('should invoke clear()', () => {
            commentBox.onCancel({ preventDefault: jest.fn() });
            expect(commentBox.clear).toBeCalled();
        });
    });

    describe('createCommentBox()', () => {
        beforeEach(() => {
            const el = document.createElement('section');
            el.addEventListener = jest.fn();

            const cancelEl = document.createElement('div');
            cancelEl.classList.add(CLASS_ANNOTATION_BUTTON_CANCEL);
            cancelEl.addEventListener = jest.fn();
            el.appendChild(cancelEl);

            const postEl = document.createElement('div');
            postEl.classList.add(CLASS_ANNOTATION_BUTTON_POST);
            postEl.addEventListener = jest.fn();
            el.appendChild(postEl);

            const textAreaEl = document.createElement('div');
            textAreaEl.classList.add(CLASS_ANNOTATION_TEXTAREA);
            textAreaEl.addEventListener = jest.fn();
            el.appendChild(textAreaEl);

            commentBox.createHTML = jest.fn().mockReturnValue(el);
        });

        it('should create and return an HTML element for the UI', () => {
            const el = commentBox.createCommentBox();
            expect(el.nodeName).not.toBeUndefined();
        });

        it('should create a reference to the text area', () => {
            commentBox.createCommentBox();
            expect(commentBox.textAreaEl).not.toBeUndefined();
        });

        it('should create a reference to the cancel button', () => {
            commentBox.createCommentBox();
            expect(commentBox.cancelEl).not.toBeUndefined();
        });

        it('should create a reference to the post button', () => {
            commentBox.createCommentBox();
            expect(commentBox.postEl).not.toBeUndefined();
        });

        it('should add an event listener on the textarea, cancel and post buttons for desktop devices', () => {
            const containerEl = commentBox.createCommentBox();
            expect(containerEl.addEventListener).not.toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.postEl.addEventListener).not.toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.cancelEl.addEventListener).not.toBeCalledWith('touchend', expect.any(Function));

            expect(containerEl.addEventListener).toBeCalledWith('click', expect.any(Function));
            expect(commentBox.cancelEl.addEventListener).toBeCalledWith('click', commentBox.onCancel);
            expect(commentBox.postEl.addEventListener).toBeCalledWith('click', commentBox.onPost);
            expect(commentBox.textAreaEl.addEventListener).toBeCalledWith('focus', commentBox.focus);
        });

        it('should add an event listener on the textarea, cancel and post buttons if the user is on a touch-enabled non-mobile device', () => {
            commentBox.hasTouch = true;

            const containerEl = commentBox.createCommentBox();

            expect(containerEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.postEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.cancelEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(containerEl.addEventListener).toBeCalledWith('click', expect.any(Function));

            expect(commentBox.cancelEl.addEventListener).toBeCalledWith('click', commentBox.onCancel);
            expect(commentBox.postEl.addEventListener).toBeCalledWith('click', commentBox.onPost);
            expect(commentBox.textAreaEl.addEventListener).toBeCalledWith('focus', commentBox.focus);

            commentBox.containerEl = null;
        });

        it('should add an event listener on the textarea, cancel and post buttons if the user is on a touch-enabled mobile device', () => {
            commentBox.hasTouch = true;
            commentBox.isMobile = true;

            const containerEl = commentBox.createCommentBox();
            expect(containerEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.postEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(commentBox.cancelEl.addEventListener).toBeCalledWith('touchend', expect.any(Function));
            expect(containerEl.addEventListener).toBeCalledWith('click', expect.any(Function));

            expect(commentBox.cancelEl.addEventListener).not.toBeCalledWith('click', commentBox.onCancel);
            expect(commentBox.postEl.addEventListener).not.toBeCalledWith('click', commentBox.onPost);
            expect(commentBox.textAreaEl.addEventListener).not.toBeCalledWith('focus', commentBox.focus);

            commentBox.containerEl = null;
        });
    });
});
