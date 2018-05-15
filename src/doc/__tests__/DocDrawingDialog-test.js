/* eslint-disable no-unused-expressions */
import * as util from '../../util';
import * as constants from '../../constants';
import DocDrawingDialog from '../DocDrawingDialog';

let dialog;
let stubs;
const sandbox = sinon.sandbox.create();

describe('doc/DocDrawingDialog', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/DocDrawingDialog-test.html');
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
        stubs = {};
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        dialog = null;
        stubs = null;
    });

    describe('isVisible()', () => {
        it('should return true if the dialog is visible', () => {
            dialog.visible = true;
            expect(dialog.isVisible()).to.be.true;
        });

        it('should return false if the dialog is not visible', () => {
            dialog.visible = false;
            expect(dialog.isVisible()).to.be.false;
        });
    });

    describe('addAnnotation()', () => {
        it('should setup the element if not already done', () => {
            dialog.element = undefined;
            sandbox.stub(dialog, 'setup');
            sandbox.stub(dialog, 'assignDrawingLabel');

            dialog.addAnnotation({});
            expect(dialog.setup).to.be.calledWith([{}]);
            expect(dialog.assignDrawingLabel).to.be.calledWith({});

            dialog.element = document.createElement('div');
            dialog.addAnnotation({});
            expect(dialog.setup).to.be.calledWith([{}]);
            expect(dialog.assignDrawingLabel).to.be.calledWith({});
        });
    });

    describe('postDrawing()', () => {
        it('should emit annotation create to indicate that the save button was pressed', () => {
            const event = {
                stopPropagation: sandbox.stub(),
                preventDefault: sandbox.stub()
            };
            sandbox.stub(dialog, 'emit');

            dialog.postDrawing(event);
            expect(dialog.emit).to.be.calledWith('annotationcreate');
            expect(event.stopPropagation).to.be.called;
            expect(event.preventDefault).to.be.called;
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            dialog.commitButtonEl = {
                addEventListener: sandbox.stub()
            };
            stubs.commitAdd = dialog.commitButtonEl.addEventListener;

            dialog.deleteButtonEl = {
                addEventListener: sandbox.stub()
            };
            stubs.deleteAdd = dialog.deleteButtonEl.addEventListener;
        });

        it('should bind touch listeners to buttons', () => {
            dialog.isMobile = true;
            dialog.hasTouch = true;
            dialog.bindDOMListeners();
            expect(stubs.commitAdd).to.not.be.calledWith('click', dialog.postDrawing);
            expect(stubs.commitAdd).to.be.calledWith('touchend', dialog.postDrawing);
            expect(stubs.deleteAdd).to.not.be.calledWith('click', dialog.deleteAnnotation);
            expect(stubs.deleteAdd).to.be.calledWith('touchend', dialog.deleteAnnotation);
        });
        it('should bind touch-enabled desktop listeners to buttons', () => {
            dialog.isMobile = false;
            dialog.hasTouch = true;
            dialog.bindDOMListeners();
            expect(stubs.commitAdd).to.be.calledWith('click', dialog.postDrawing);
            expect(stubs.commitAdd).to.be.calledWith('touchend', dialog.postDrawing);
            expect(stubs.deleteAdd).to.be.calledWith('click', dialog.deleteAnnotation);
            expect(stubs.deleteAdd).to.be.calledWith('touchend', dialog.deleteAnnotation);
        });
        it('should bind desktop listeners to buttons', () => {
            dialog.isMobile = false;
            dialog.hasTouch = false;
            dialog.bindDOMListeners();
            expect(stubs.commitAdd).to.be.calledWith('click', dialog.postDrawing);
            expect(stubs.commitAdd).to.not.be.calledWith('touchend', dialog.postDrawing);
            expect(stubs.deleteAdd).to.be.calledWith('click', dialog.deleteAnnotation);
            expect(stubs.deleteAdd).to.not.be.calledWith('touchend', dialog.deleteAnnotation);
        });
    });

    describe('unbindDOMListeners()', () => {
        it('should unbind listeners on a commit button element', () => {
            dialog.hasTouch = true;
            dialog.commitButtonEl = {
                removeEventListener: sandbox.stub()
            };

            dialog.unbindDOMListeners();
            expect(dialog.commitButtonEl.removeEventListener).to.be.calledWith('click', dialog.postDrawing);
            expect(dialog.commitButtonEl.removeEventListener).to.be.calledWith('touchend', dialog.postDrawing);
        });

        it('should unbind listeners on a delete button element', () => {
            dialog.hasTouch = true;
            dialog.deleteButtonEl = {
                removeEventListener: sandbox.stub()
            };

            dialog.unbindDOMListeners();
            expect(dialog.deleteButtonEl.removeEventListener).to.be.calledWith('click', dialog.deleteAnnotation);
            expect(dialog.deleteButtonEl.removeEventListener).to.be.calledWith('touchend', dialog.deleteAnnotation);
        });
    });

    describe('setup()', () => {
        let drawingDialogEl;

        beforeEach(() => {
            drawingDialogEl = document.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_DIALOG);

            sandbox.stub(dialog, 'generateDialogEl').returns(drawingDialogEl);
            sandbox.stub(dialog, 'bindDOMListeners');
            sandbox.stub(dialog, 'addAnnotation');
        });

        it('should setup the dialog element without a commit button when given an annotation', () => {
            const annotation = {
                user: {
                    name: 'Yao Ming'
                }
            };
            sandbox.stub(util, 'getFirstAnnotation').returns(annotation);

            expect(dialog.element).to.be.undefined;
            dialog.setup([annotation]);
            expect(dialog.generateDialogEl).to.be.called;
            expect(dialog.bindDOMListeners).to.be.called;
            expect(dialog.addAnnotation).to.be.called;
            expect(dialog.element.contains(dialog.drawingDialogEl));
            expect(dialog.commitButtonEl).to.be.null;
        });

        it('should setup the dialog element with a commit button when not given an annotation', () => {
            sandbox.stub(util, 'getFirstAnnotation');
            dialog.setup();
            expect(dialog.generateDialogEl).to.be.called;
            expect(dialog.bindDOMListeners).to.be.called;
            expect(dialog.addAnnotation).to.not.be.called;
            expect(dialog.element.contains(dialog.drawingDialogEl));
            expect(dialog.commitButtonEl).to.not.be.undefined;
            expect(dialog.element.contains(dialog.commitButtonEl));
        });
    });

    describe('position()', () => {
        it('should insert the element into the page element and set the position', () => {
            const rect = {
                width: 1
            };
            const pageEl = {
                contains: sandbox.stub().returns(false),
                appendChild: sandbox.stub()
            };

            dialog.location = {
                page: 1
            };
            dialog.annotatedElement = {
                querySelector: sandbox.stub().returns(pageEl)
            };
            dialog.element = {
                style: {
                    left: 0,
                    top: 0
                },
                getBoundingClientRect: sandbox.stub().returns(rect)
            };

            dialog.position(5, 10);
            expect(dialog.element.getBoundingClientRect).to.be.called;
            expect(pageEl.contains).to.be.called;
            expect(pageEl.appendChild).to.be.calledWith(dialog.element);
            expect(dialog.annotatedElement.querySelector).to.be.called;
            expect(dialog.element.style.left).to.equal('4px', '10px');
        });
    });

    describe('hide()', () => {
        it('should hide the element with css', () => {
            dialog.element = {};
            dialog.visible = true;
            sandbox.stub(util, 'hideElement');

            dialog.hide();
            expect(util.hideElement).to.be.calledWith(dialog.element);
            expect(dialog.visible).to.be.false;
        });
    });

    describe('show()', () => {
        it('should show the element with css', () => {
            const element = 'e';

            sandbox.stub(util, 'showElement');
            dialog.element = element;
            expect(dialog.visible).to.be.false;

            dialog.show();
            expect(util.showElement).to.be.calledWith(element);
            expect(dialog.visible).to.be.true;
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
            stubs.getFirstAnnotation = sandbox.stub(util, 'getFirstAnnotation').returns(annotation);
        });

        it('should generate the correctly formatted label dialog element', () => {
            annotation.permissions.can_delete = false;

            const dialogEl = dialog.generateDialogEl([annotation]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).to.be.true;
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).to.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).to.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).to.not.be.null;
        });

        it('should generate without a save button', () => {
            const dialogEl = dialog.generateDialogEl([annotation]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).to.be.true;
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).to.not.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).to.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).to.not.be.null;
        });

        it('should generate a save and delete button', () => {
            stubs.getFirstAnnotation.returns(null);
            const dialogEl = dialog.generateDialogEl([]);
            expect(dialogEl.classList.contains(constants.CLASS_ANNOTATION_DRAWING_DIALOG)).to.be.true;
            expect(dialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN)).to.not.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN)).to.not.be.null;
            expect(dialogEl.querySelector(constants.SELECTOR_ANNOTATION_DRAWING_LABEL)).to.not.be.null;
        });
    });

    describe('assignDrawingLabel()', () => {
        it('should assign a name to a drawing label', () => {
            const drawingLabelEl = {};
            const notYaoMing = 'not yao ming';
            dialog.drawingDialogEl = {
                querySelector: sandbox.stub().returns(drawingLabelEl)
            };
            sandbox.stub(util, 'replacePlaceholders').returns(notYaoMing);
            sandbox.stub(util, 'showElement');

            dialog.assignDrawingLabel({ user: { id: '1' } });
            expect(drawingLabelEl.textContent).to.equal(notYaoMing);
            expect(dialog.drawingDialogEl.querySelector).to.be.called;
            expect(util.replacePlaceholders).to.be.called;
            expect(util.showElement).to.be.called;
        });

        it('should do nothing when given an invalid annotation or does not have a dialog', () => {
            sandbox.stub(util, 'showElement');

            dialog.drawingDialogEl = document.createElement('div');
            dialog.assignDrawingLabel(null);
            dialog.assignDrawingLabel({ user: { id: '0' } });

            dialog.drawingDialogEl = undefined;
            dialog.assignDrawingLabel({ user: { id: '1' } });

            expect(util.showElement).to.not.be.called;
        });
    });
});
