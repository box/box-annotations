/* eslint-disable no-unused-expressions */
import * as docUtil from '../docUtil';
import {
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_CONTAINER,
    CLASS_ANNOTATION_DIALOG,
    DATA_TYPE_ANNOTATION_DIALOG
} from '../../constants';
import * as util from '../../util';

const sandbox = sinon.sandbox.create();
let stubs = {};

describe('doc/docUtil', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/docUtil-test.html');
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        fixture.cleanup();
        stubs = {};
    });

    describe('isPresentation()', () => {
        it('should return false if annotatedElement is a document', () => {
            const docEl = document.querySelector('.annotatedElement');
            const result = docUtil.isPresentation(docEl);
            expect(result).to.be.false;
        });

        it('should return true if annotatedElement is a presentation', () => {
            const docEl = document.querySelector('.annotatedElement');
            docEl.classList.add('bp-doc-presentation');
            const result = docUtil.isPresentation(docEl);
            expect(result).to.be.true;
        });
    });

    describe('hasActiveDialog()', () => {
        it('should return false if no annotation dialog is open', () => {
            const currDialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);
            currDialogEl.classList.add('bp-is-hidden');
            const result = docUtil.hasActiveDialog(document);
            expect(result).to.be.false;
        });

        it('should return true if an annotion dialog is open', () => {
            const docEl = document.querySelector('.annotatedElement');
            const currDialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);
            currDialogEl.classList.add('bp-is-hidden');

            const openDialogEl = document.createElement('div');
            openDialogEl.classList.add(CLASS_ANNOTATION_DIALOG);
            docEl.appendChild(openDialogEl);

            const result = docUtil.hasActiveDialog(document);
            expect(result).to.be.true;
        });
    });

    describe('hasSelectionChanged()', () => {
        it('should return false if the selection is invalid or no previous selection exists or if the selections matches', () => {
            expect(docUtil.hasSelectionChanged()).to.be.false;
            expect(docUtil.hasSelectionChanged({})).to.be.false;
            expect(docUtil.hasSelectionChanged({ rangeCount: 1 })).to.be.false;
        });

        it('should return true if the previous and current selection have changed', () => {
            const selection = {
                getRangeAt: sandbox.stub().returns({ compareBoundaryPoints: sandbox.stub().returns(false) })
            };
            const diffSelection = {
                getRangeAt: sandbox.stub().returns({ compareBoundaryPoints: sandbox.stub().returns(true) })
            };
            expect(docUtil.hasSelectionChanged(diffSelection, selection)).to.be.true;
            expect(docUtil.hasSelectionChanged(selection, selection)).to.be.false;
        });
    });

    describe('isPointInPolyOpt()', () => {
        it('should return true if point is inside polygon', () => {
            const polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
            expect(docUtil.isPointInPolyOpt(polygon, 50, 50)).to.be.true;
        });

        it('should return false if point is outside polygon', () => {
            const polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
            expect(docUtil.isPointInPolyOpt(polygon, 120, 50)).to.be.false;
        });
    });

    describe('isSelectionPresent()', () => {
        it('should return true if there is a non-empty selection on the page', () => {
            const barEl = document.querySelector('.bar');
            const range = document.createRange();
            range.selectNode(barEl.childNodes[0]);
            const selection = window.getSelection();
            selection.addRange(range);
            expect(docUtil.isSelectionPresent()).to.be.true;
        });

        it('should return false if there is no non-empty selection on the page', () => {
            expect(docUtil.isSelectionPresent()).to.be.false;
        });
    });

    describe('convertPDFSpaceToDOMSpace()', () => {
        it('should convert coordinates from PDF space to DOM space', () => {
            const coordinates = [300, 300];

            // 300 * 4/3 * 0.5, 1000 - 300 * 4/3 * 0.5
            const expected = [200, 800];
            expect(docUtil.convertPDFSpaceToDOMSpace(coordinates, 1000, 0.5)).to.deep.equal(expected);
        });
    });

    describe('convertDOMSpaceToPDFSpace()', () => {
        it('should convert coordinates from DOM space to PDF space', () => {
            const coordinates = [400, 400];

            // 400 * 3/4 / 0.5 to fixed 4, (1000 - 400) * 3/4 / 0.5 to fixed 4
            const expected = [Number(600).toFixed(4), Number(900).toFixed(4)];
            expect(docUtil.convertDOMSpaceToPDFSpace(coordinates, 1000, 0.5)).to.deep.equal(expected);
        });
    });

    describe('getBrowserCoordinatesFromLocation()', () => {
        it('should return DOM coordinates from an annotation location object', () => {
            const location = {
                x: 300,
                y: 300,
                dimensions: {
                    x: 600,
                    y: 1000
                }
            };

            const annotatedEl = document.querySelector('.annotatedElement');
            annotatedEl.style.height = '1030px';
            annotatedEl.style.width = '600px';

            expect(docUtil.getBrowserCoordinatesFromLocation(location, annotatedEl)).to.deep.equal([400, 600]);
        });
    });

    describe('getLowerRightCornerOfLastQuadPoint()', () => {
        const quadPoints = [[0, 10, 10, 10, 10, 20, 0, 20], [0, 0, 10, 0, 10, 10, 0, 10]];

        expect(docUtil.getLowerRightCornerOfLastQuadPoint(quadPoints)).to.deep.equal([10, 0]);
    });

    describe('getTopRightCornerOfLastQuadPoint()', () => {
        const quadPoints = [[0, 10, 10, 10, 10, 20, 0, 20], [0, 0, 10, 0, 10, 10, 0, 10]];

        expect(docUtil.getTopRightCornerOfLastQuadPoint(quadPoints)).to.deep.equal([0, 0]);
    });

    describe('isValidSelection', () => {
        it('should return false if there are no ranges present in the selection', () => {
            const selection = {
                rangeCount: 0,
                isCollapsed: false,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).to.be.false;
        });

        it('should return false if the selection isn\'t collapsed', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: true,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).to.be.false;
        });

        it('should return false if the selection is empty', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: false,
                toString: () => ''
            };
            expect(docUtil.isValidSelection(selection)).to.be.false;
        });

        it('should return true if the selection is valid', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: false,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).to.be.true;
        });
    });

    describe('scaleCanvas()', () => {
        const width = 100;
        const height = 200;

        // PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
        const pagePadding = 30;

        beforeEach(() => {
            stubs.annotationLayer = document.createElement('canvas');
            stubs.context = {
                scale: sandbox.stub()
            };
            sandbox.stub(stubs.annotationLayer, 'getContext').returns(stubs.context);

            stubs.pageEl = {
                getBoundingClientRect: sandbox.stub().returns({
                    width,
                    height
                })
            };

            stubs.canvasHeight = height - pagePadding;
        });

        it('should adjust canvas height and width and return the scaled canvas', () => {
            const scaledCanvas = docUtil.scaleCanvas(stubs.pageEl, stubs.annotationLayer);
            expect(scaledCanvas.width).to.equal(width);
            expect(scaledCanvas.height).to.equal(stubs.canvasHeight);
            expect(scaledCanvas.style.width).to.not.equal(`${width}px`);
            expect(scaledCanvas.style.height).to.not.equal(`${height}px`);
        });

        it('should add style height & width if device pixel ratio is not 1', () => {
            const pxRatio = 2;
            window.devicePixelRatio = pxRatio;

            const scaledCanvas = docUtil.scaleCanvas(stubs.pageEl, stubs.annotationLayer);

            expect(scaledCanvas.width).to.equal(width * pxRatio);
            expect(scaledCanvas.height).to.equal(stubs.canvasHeight * pxRatio);
            expect(scaledCanvas.style.width).to.equal(`${width}px`);
            expect(scaledCanvas.style.height).to.equal(`${stubs.canvasHeight}px`);
            expect(stubs.annotationLayer.getContext).to.be.called;
        });
    });

    describe('getContext()', () => {
        beforeEach(() => {
            stubs.annotationLayer = {
                width: 0,
                height: 0,
                getContext: sandbox.stub().returns('2d context'),
                classList: {
                    add: sandbox.stub()
                },
                style: {}
            };

            stubs.pageEl = {
                querySelector: sandbox.stub(),
                getBoundingClientRect: sandbox.stub(),
                insertBefore: sandbox.stub()
            };

            stubs.canvasWrapper = {
                appendChild: sandbox.stub()
            };

            sandbox.stub(docUtil, 'scaleCanvas').returns(stubs.annotationLayer);
        });

        it('should return null if there is no pageEl', () => {
            const result = docUtil.getContext(null, 'random-class-name', 0, 0);
            expect(result).to.equal(null);
        });

        it('should not insert into the pageEl if the annotationLayerEl already exists', () => {
            stubs.pageEl.querySelector.returns(stubs.annotationLayer);
            docUtil.getContext(stubs.pageEl, 'random-class-name');
            expect(stubs.annotationLayer.getContext).to.be.called;
            expect(stubs.pageEl.insertBefore).to.not.be.called;
        });

        it('should insert after the page textlayer if the annotationLayerEl does not exist and the text layer is available', () => {
            stubs.annotationLayer.getContext.returns({
                scale: sandbox.stub()
            });
            stubs.pageEl.getBoundingClientRect.returns({ width: 0, height: 0 });
            stubs.pageEl.querySelector.onSecondCall().returns({});
            const docStub = sandbox.stub(document, 'createElement').returns(stubs.annotationLayer);

            docUtil.getContext(stubs.pageEl, 'random-class-name', 0, 0);
            expect(docStub).to.be.called;
            expect(stubs.annotationLayer.getContext).to.be.called;
            expect(stubs.annotationLayer.classList.add).to.be.called;
            expect(stubs.pageEl.insertBefore).to.be.called;
            expect(stubs.canvasWrapper.appendChild).to.not.be.called;
        });

        it('should insert into the page canvasWrapper if the annotationLayerEl does not exist and no text layer is available', () => {
            stubs.annotationLayer.getContext.returns({
                scale: sandbox.stub()
            });
            stubs.pageEl.getBoundingClientRect.returns({ width: 0, height: 0 });
            const docStub = sandbox.stub(document, 'createElement').returns(stubs.annotationLayer);
            stubs.pageEl.querySelector.onThirdCall().returns(stubs.canvasWrapper);

            docUtil.getContext(stubs.pageEl, 'random-class-name', 0, 0);
            expect(docStub).to.be.called;
            expect(stubs.annotationLayer.getContext).to.be.called;
            expect(stubs.annotationLayer.classList.add).to.be.called;
            expect(stubs.pageEl.insertBefore).to.not.be.called;
            expect(stubs.canvasWrapper.appendChild).to.be.called;
        });
    });

    describe('getPageEl()', () => {
        it('should return the result of querySelector', () => {
            const page = 2;
            const docEl = document.querySelector('.annotatedElement');
            const truePageEl = document.querySelector(`.page[data-page-number="${page}"]`);
            docEl.appendChild(truePageEl);

            const pageEl = docUtil.getPageEl(docEl, page);
            expect(pageEl).to.equal(truePageEl);
        });
    });

    describe('isDialogDataType()', () => {
        it('should return true if the mouse event occured in a highlight dialog', () => {
            sandbox.stub(util, 'findClosestDataType').returns(DATA_TYPE_ANNOTATION_DIALOG);
            expect(docUtil.isDialogDataType({})).to.be.true;
        });

        it('should return false if the mouse event occured outside a highlight dialog', () => {
            sandbox.stub(util, 'findClosestDataType').returns('something');
            expect(docUtil.isDialogDataType({})).to.be.false;
        });
    });

    describe('getDialogCoordsFromRange()', () => {
        let range, parentContainer;
        const text = 'This is some text';
        beforeEach(() => {
            parentContainer = document.createElement('div');
            parentContainer.innerHTML = text;
            const endContainer = parentContainer.firstChild;
            range = {
                endContainer,
                endOffset: 6 // split 'is' => "This i", "s some text"
            };
        });

        it('should split the text node by the endOffset to add the position element to', () => {
            let offset;
            sandbox.stub(range.endContainer, 'splitText').callsFake((value) => {
                offset = value;
            });
            docUtil.getDialogCoordsFromRange(range);

            expect(offset).to.equal(6);
        });

        describe('When end container is not a part of the text range', () => {
            it('should calculate coords off of the end of the second last element in the range', () => {
                const parent = document.createElement('div');
                const first = document.createElement('span');
                const appendStub = sandbox.stub(first, 'appendChild');
                const second = document.createElement('p');
                parent.appendChild(first);
                parent.appendChild(second);

                range.endContainer = second;
                docUtil.getDialogCoordsFromRange(range);

                expect(appendStub).to.be.called;
            });

            it('should calculate coords from the last container if no second last element in the range', () => {
                const parent = document.createElement('div');
                const insertStub = sandbox.stub(parent, 'insertBefore');
                const first = document.createElement('span');
                parent.appendChild(first);

                range.endContainer = parent;
                docUtil.getDialogCoordsFromRange(range);

                expect(insertStub).to.be.called;
            });

            it('should calculate coords from the end of the end container, if no elements in the end of the range', () => {
                const parent = document.createElement('div');
                const appendStub = sandbox.stub(parent, 'appendChild');

                range.endContainer = parent;
                docUtil.getDialogCoordsFromRange(range);

                expect(appendStub).to.be.called;
            });
        });

        it('should clean out the position element from the container it was added to', () => {
            docUtil.getDialogCoordsFromRange(range);
            const dummy = parentContainer.querySelector('span');
            expect(dummy).to.not.exist;
        });

        it('should use the position element\'s bounds for the x and y corrdinate', () => {
            const fakeSpan = document.createElement('span');
            sandbox.stub(fakeSpan, 'getBoundingClientRect').callsFake(() => {
                return { right: 10, bottom: 11 };
            });

            const createStub = sandbox.stub(document, 'createElement');
            createStub.withArgs('span').returns(fakeSpan);
            createStub.callThrough();

            const coords = docUtil.getDialogCoordsFromRange(range);
            expect(coords.x).to.equal(10);
            expect(coords.y).to.equal(11);
        });
    });
});
