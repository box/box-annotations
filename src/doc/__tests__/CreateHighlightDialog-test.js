/* eslint-disable no-unused-expressions */
import CreateHighlightDialog from '../CreateHighlightDialog';
import {
    CLASS_ADD_HIGHLIGHT_BTN,
    CLASS_ADD_HIGHLIGHT_COMMENT_BTN,
    CLASS_ANNOTATION_CARET,
    CLASS_HIDDEN,
    CREATE_EVENT
} from '../../constants';
import CommentBox from '../../CommentBox';
import * as util from '../../util';
import * as docUtil from '../docUtil';

const CLASS_CREATE_DIALOG = 'bp-create-annotation-dialog';
let stubs = {};

describe('doc/CreateHighlightDialog', () => {
    const sandbox = sinon.sandbox.create();
    let dialog;
    let parentEl;
    const localized = {
        highlightToggle: 'highlight toggle',
        highlightComment: 'highlight comment'
    };

    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/CreateHighlightDialog-test.html');

        const parentEl = document.createElement('div');
        parentEl.classList.add('bp-create-dialog-container');
        dialog = new CreateHighlightDialog(parentEl, {
            allowHighlight: true,
            allowComment: true,
            localized
        });
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }

        parentEl = null;
        stubs = {};
    });

    describe('contructor()', () => {
        it('should default to disable highlights and comments if no config passed in', () => {
            const instance = new CreateHighlightDialog(document.createElement('div'));
            expect(instance.allowHighlight).to.be.false;
            expect(instance.allowComment).to.be.false;
        });

        it('should take config falsey value to disable highlights and comments, when passed in', () => {
            const config = {
                allowHighlight: true,
                allowComment: false,
                localized
            };
            const instance = new CreateHighlightDialog(document.createElement('div'), config);
            expect(instance.allowHighlight).to.be.truthy;
            expect(instance.allowComment).to.be.falsy;
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            stubs.pageInfo = sandbox.stub(util, 'getPageInfo');
            stubs.setPosition = sandbox.stub(dialog, 'setPosition');
            dialog.parentEl = {
                querySelector: () => {},
                appendChild: () => {}
            };
            stubs.parentMock = sandbox.mock(dialog.parentEl);
        });

        it('should do nothing if no selection is passed in', () => {
            stubs.parentMock.expects('appendChild').never();
            dialog.show({});
            expect(util.getPageInfo).to.not.be.called;
        });

        it('should do nothing if no page element is calculated from the selection', () => {
            stubs.pageInfo.returns({});
            stubs.parentMock.expects('appendChild').never();
            dialog.show({}, {});
            expect(stubs.pageInfo).to.be.called;
        })

        it('should set the parentEl to a new reference, via setParentEl(), if a new one is supplied', () => {
            const newParent = document.createElement('span');
            stubs.pageInfo.returns({ pageEl: dialog.parentEl });

            stubs.parentMock.expects('querySelector');
            stubs.parentMock.expects('appendChild');
            dialog.show(newParent, {});
        });
    });

    describe('setPosition()', () => {
        beforeEach(() => {
            stubs.selection = {
                getRangeAt: () => {},
                rangeCount: 1
            };
            stubs.selectionMock = sandbox.mock(stubs.selection);
            stubs.pageInfo = sandbox.stub(util, 'getPageInfo');
            stubs.update = sandbox.stub(dialog, 'updatePosition');
            stubs.getCoords = sandbox.stub(docUtil, 'getDialogCoordsFromRange');
        });

        it('should do nothing if the selection is invalid', () => {
            stubs.selection.rangeCount = undefined;
            stubs.selectionMock.expects('getRangeAt').never();
            dialog.setPosition(stubs.selection);
        });

        it('should do nothing if no page element is calculated from the selection', () => {
            stubs.pageInfo.returns({});
            dialog.setPosition(stubs.selection);
            expect(stubs.update).to.not.be.called;
        });

        it('should position the dialog according to the bottom right corner of the selection', () => {
            stubs.pageInfo.returns({ pageEl: document.createElement('div') });
            stubs.getCoords.returns({x: 1, y: 2});
            dialog.setPosition(stubs.selection);
            expect(stubs.update).to.be.called;
        });
    });

    describe('destroy()', () => {
        it('should remove click event listener from the highlight button', () => {
            const remove = sandbox.stub(dialog.highlightCreateEl, 'removeEventListener');
            dialog.destroy();
            expect(remove).to.be.calledWith('click');
        });

        it('should remove click event listener from the comment button', () => {
            const remove = sandbox.stub(dialog.commentCreateEl, 'removeEventListener');
            dialog.destroy();
            expect(remove).to.be.calledWith('click');
        });

        it('should remove out all touch events, if touch enabled', () => {
            dialog.hasTouch = true;
            dialog.isMobile = true;
            const highlightCreateStub = sandbox.stub(dialog.highlightCreateEl, 'removeEventListener');
            const commentCreateStub = sandbox.stub(dialog.commentCreateEl, 'removeEventListener');

            const stubs = [
                {
                    stub: highlightCreateStub,
                    args: ['touchstart', dialog.stopPropagation]
                },
                {
                    stub: highlightCreateStub,
                    args: ['touchend', dialog.onHighlightClick]
                },
                {
                    stub: commentCreateStub,
                    args: ['touchstart', dialog.stopPropagation]
                },
                {
                    stub: commentCreateStub,
                    args: ['touchend', dialog.onCommentClick]
                },
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
            sandbox.stub(util, 'repositionCaret').returns(x);
            dialog.updatePosition();
            expect(dialog.containerEl.style.left).to.equal(`${x}px`);
        });
    });

    describe('onHighlightClick()', () => {
        it('should invoke the "plain" highlight event', () => {
            const emit = sandbox.stub(dialog, 'emit');
            dialog.onHighlightClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(emit).to.be.calledWith(CREATE_EVENT.plain);
        });
    });

    describe('onCommentClick()', () => {
        beforeEach(() => {
            dialog.show();
        });

        it('should invoke the "comment" highlight event', () => {
            const emit = sandbox.stub(dialog, 'emit');
            dialog.onCommentClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(emit).to.be.calledWith(CREATE_EVENT.comment);
        });

        it('should show the comment box', () => {
            const show = sandbox.stub(dialog.commentBox, 'show');
            dialog.onCommentClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(show).to.be.called;
        });

        it('should focus on the comment box', () => {
            const focus = sandbox.stub(dialog.commentBox, 'focus');
            dialog.onCommentClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(focus).to.be.called;
        });

        it('should hide the highlight buttons', () => {
            const setVis = sandbox.stub(dialog, 'setButtonVisibility');
            dialog.onCommentClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(setVis).to.be.called;
        });

        it('should invoke update position', () => {
            const update = sandbox.stub(dialog, 'updatePosition');
            dialog.onCommentClick({ preventDefault: () => {}, stopPropagation: () => {} });
            expect(update).to.be.called;
        });
    });

    describe('createElement()', () => {
        it('should create a div with the proper create highlight class', () => {
            dialog.createElement();
            expect(dialog.containerEl.nodeName).to.equal('DIV');
            expect(dialog.containerEl.classList.contains(CLASS_CREATE_DIALOG)).to.be.true;
        });

        it('should make a reference to the highlight button', () => {
            dialog.createElement();
            expect(dialog.highlightCreateEl).to.exist;
        });

        it('should make a reference to the comment button', () => {
            dialog.createElement();
            expect(dialog.commentCreateEl).to.exist;
        });

        it('should create a comment box', () => {
            dialog.createElement();
            expect(dialog.commentBox).to.be.an.instanceof(CommentBox);
        });

        it('should not create the caret if on a mobile device', () => {
            dialog.isMobile = true;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(`.${CLASS_ANNOTATION_CARET}`)).to.not.exist;
        });

        it('should not create a highlight button if highlights are disabled', () => {
            dialog.allowHighlight = false;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(`.${CLASS_ADD_HIGHLIGHT_BTN}`)).to.not.exist;
        });

        it('should not create a comment box or button if comments are disabled', () => {
            dialog.allowComment = false;
            dialog.commentBox = undefined;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(`.${CLASS_ADD_HIGHLIGHT_COMMENT_BTN}`)).to.not.exist;
            expect(dialog.commentBox).to.not.exist;
        });
    });
});
