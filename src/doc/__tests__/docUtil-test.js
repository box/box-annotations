/* eslint-disable no-unused-expressions */
import * as docUtil from '../docUtil';
import { DATA_TYPE_ANNOTATION_DIALOG, SELECTOR_ANNOTATED_ELEMENT } from '../../constants';
import * as util from '../../util';

const html = `<div class="annotated-element">
    <div class="ba-annotation-dialog" style="width: 10px; height: 10px;">
        <div class="annotation-container"></div>
    </div>
</div>

<div class="page" data-page-number="2">
    <div class="foo"></div>
</div>

<div class="bar">some text</div>`;

describe('doc/docUtil', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        document.createRange = jest.fn();
        global.Range = { START_TO_END: 1 };
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
    });

    describe('isPresentation()', () => {
        it('should return false if annotatedElement is a document', () => {
            const docEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            const result = docUtil.isPresentation(docEl);
            expect(result).toBeFalsy();
        });

        it('should return true if annotatedElement is a presentation', () => {
            const docEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            docEl.classList.add('bp-doc-presentation');
            const result = docUtil.isPresentation(docEl);
            expect(result).toBeTruthy();
        });
    });

    describe('hasSelectionChanged()', () => {
        it('should return false if the selection is invalid or no previous selection exists or if the selections matches', () => {
            expect(docUtil.hasSelectionChanged()).toBeFalsy();
            expect(docUtil.hasSelectionChanged({})).toBeFalsy();
            expect(docUtil.hasSelectionChanged({ rangeCount: 1 })).toBeFalsy();
        });

        it('should return true if the previous and current selection have changed', () => {
            const selection = {
                getRangeAt: jest.fn().mockReturnValue({ compareBoundaryPoints: jest.fn().mockReturnValue(false) })
            };
            const diffSelection = {
                getRangeAt: jest.fn().mockReturnValue({ compareBoundaryPoints: jest.fn().mockReturnValue(true) })
            };
            expect(docUtil.hasSelectionChanged(diffSelection, selection)).toBeTruthy();
            expect(docUtil.hasSelectionChanged(selection, selection)).toBeFalsy();
        });
    });

    describe('isPointInPolyOpt()', () => {
        it('should return true if point is inside polygon', () => {
            const polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
            expect(docUtil.isPointInPolyOpt(polygon, 50, 50)).toBeTruthy();
        });

        it('should return false if point is outside polygon', () => {
            const polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
            expect(docUtil.isPointInPolyOpt(polygon, 120, 50)).toBeFalsy();
        });
    });

    describe('isSelectionPresent()', () => {
        it('should return true if there is a non-empty selection on the page', () => {
            window.getSelection = jest.fn().mockReturnValue({
                isCollapsed: false,
                rangeCount: 1
            });
            expect(docUtil.isSelectionPresent()).toBeTruthy();
        });

        it('should return false if there is no non-empty selection on the page', () => {
            window.getSelection = jest.fn();
            expect(docUtil.isSelectionPresent()).toBeFalsy();
        });
    });

    describe('convertPDFSpaceToDOMSpace()', () => {
        it('should convert coordinates from PDF space to DOM space', () => {
            const coordinates = [300, 300];

            // 300 * 4/3 * 0.5, 1000 - 300 * 4/3 * 0.5
            const expected = [200, 800];
            expect(docUtil.convertPDFSpaceToDOMSpace(coordinates, 1000, 0.5)).toStrictEqual(expected);
        });
    });

    describe('convertDOMSpaceToPDFSpace()', () => {
        it('should convert coordinates from DOM space to PDF space', () => {
            const coordinates = [400, 400];

            // 400 * 3/4 / 0.5 to fixed 4, (1000 - 400) * 3/4 / 0.5 to fixed 4
            const expected = [Number(600).toFixed(4), Number(900).toFixed(4)];
            expect(docUtil.convertDOMSpaceToPDFSpace(coordinates, 1000, 0.5)).toStrictEqual(expected);
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

            const annotatedEl = document.createElement('div');
            annotatedEl.querySelector = jest.fn().mockReturnValue(rootElement);
            rootElement.getBoundingClientRect = jest.fn().mockReturnValue({
                height: 1030,
                width: 600
            });

            expect(docUtil.getBrowserCoordinatesFromLocation(location, annotatedEl)).toStrictEqual([400, 600]);
        });
    });

    describe('getLowerRightCornerOfLastQuadPoint()', () => {
        const quadPoints = [[0, 10, 10, 10, 10, 20, 0, 20], [0, 0, 10, 0, 10, 10, 0, 10]];
        expect(docUtil.getLowerRightCornerOfLastQuadPoint(quadPoints)).toStrictEqual([10, 0]);
    });

    describe('getTopRightCornerOfLastQuadPoint()', () => {
        const quadPoints = [[0, 10, 10, 10, 10, 20, 0, 20], [0, 0, 10, 0, 10, 10, 0, 10]];
        expect(docUtil.getTopRightCornerOfLastQuadPoint(quadPoints)).toStrictEqual([0, 0]);
    });

    describe('isValidSelection', () => {
        it('should return false if there are no ranges present in the selection', () => {
            const selection = {
                rangeCount: 0,
                isCollapsed: false,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).toBeFalsy();
        });

        it('should return false if the selection isn\'t collapsed', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: true,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).toBeFalsy();
        });

        it('should return false if the selection is empty', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: false,
                toString: () => ''
            };
            expect(docUtil.isValidSelection(selection)).toBeFalsy();
        });

        it('should return true if the selection is valid', () => {
            const selection = {
                rangeCount: 1,
                isCollapsed: false,
                toString: () => 'I am valid!'
            };
            expect(docUtil.isValidSelection(selection)).toBeTruthy();
        });
    });

    describe('scaleCanvas()', () => {
        const width = 100;
        const height = 200;

        // PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
        const pagePadding = 30;
        const annotationLayer = document.createElement('canvas');
        const pageEl = {
            getBoundingClientRect: jest.fn().mockReturnValue({
                width,
                height
            })
        };
        const canvasHeight = height - pagePadding;

        beforeEach(() => {
            const context = {
                scale: jest.fn()
            };
            annotationLayer.getContext = jest.fn().mockReturnValue(context);
        });

        it('should adjust canvas height and width and return the scaled canvas', () => {
            const scaledCanvas = docUtil.scaleCanvas(pageEl, annotationLayer);
            expect(scaledCanvas.width).toEqual(width);
            expect(scaledCanvas.height).toEqual(canvasHeight);
            expect(scaledCanvas.style.width).not.toEqual(`${width}px`);
            expect(scaledCanvas.style.height).not.toEqual(`${height}px`);
        });

        it('should add style height & width if device pixel ratio is not 1', () => {
            const pxRatio = 2;
            window.devicePixelRatio = pxRatio;

            const scaledCanvas = docUtil.scaleCanvas(pageEl, annotationLayer);

            expect(scaledCanvas.width).toEqual(width * pxRatio);
            expect(scaledCanvas.height).toEqual(canvasHeight * pxRatio);
            expect(scaledCanvas.style.width).toEqual(`${width}px`);
            expect(scaledCanvas.style.height).toEqual(`${canvasHeight}px`);
            expect(annotationLayer.getContext).toBeCalled();
        });
    });

    describe('getContext()', () => {
        const annotationLayer = document.createElement('canvas');
        const canvasWrapper = document.createElement('div');
        const textLayer = document.createElement('div');

        beforeEach(() => {
            docUtil.scaleCanvas = jest.fn().mockReturnValue(annotationLayer);

            annotationLayer.getContext = jest.fn().mockReturnValue({
                scale: jest.fn()
            });

            rootElement.insertBefore = jest.fn();
            rootElement.getBoundingClientRect = jest.fn().mockReturnValue({ width: 0, height: 0 });

            if (rootElement.querySelector('canvas')) {
                rootElement.removeChild(annotationLayer);
            }

            textLayer.classList.add('textLayer');
            textLayer.insertBefore = jest.fn();

            canvasWrapper.classList.add('canvasWrapper');
            canvasWrapper.appendChild = jest.fn();
        });

        it('should return null if there is no pageEl', () => {
            const result = docUtil.getContext(null, 'random-class-name', 0, 0);
            expect(result).toEqual(null);
        });

        it('should not insert into the pageEl if the annotationLayerEl already exists', () => {
            rootElement.appendChild(annotationLayer);
            docUtil.getContext(rootElement, 'random-class-name');
            expect(rootElement.insertBefore).not.toBeCalled();
        });

        it('should insert before the page textlayer if the annotationLayerEl does not exist and the text layer is available', () => {
            rootElement.appendChild(textLayer);
            docUtil.getContext(rootElement, 'random-class-name', 0, 0);
            expect(rootElement.insertBefore).toBeCalled();
            expect(canvasWrapper.appendChild).not.toBeCalled();
            rootElement.removeChild(textLayer);
        });

        it('should insert into the page canvasWrapper if the annotationLayerEl does not exist and no text layer is available', () => {
            rootElement.appendChild(canvasWrapper);
            docUtil.getContext(rootElement, 'random-class-name', 0, 0);
            expect(rootElement.insertBefore).not.toBeCalled();
            expect(canvasWrapper.appendChild).toBeCalled();
        });
    });

    describe('getPageEl()', () => {
        it('should return the result of querySelector', () => {
            const page = 2;
            const docEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            const truePageEl = document.querySelector(`.page[data-page-number="${page}"]`);
            docEl.appendChild(truePageEl);

            const pageEl = docUtil.getPageEl(docEl, page);
            expect(pageEl).toEqual(truePageEl);
        });
    });

    describe('isDialogDataType()', () => {
        it('should return true if the mouse event occured in a highlight dialog', () => {
            util.findClosestDataType = jest.fn().mockReturnValue(DATA_TYPE_ANNOTATION_DIALOG);
            expect(docUtil.isDialogDataType({})).toBeTruthy();
        });

        it('should return false if the mouse event occured outside a highlight dialog', () => {
            util.findClosestDataType = jest.fn().mockReturnValue('something');
            expect(docUtil.isDialogDataType({})).toBeFalsy();
        });
    });

    describe('getDialogCoordsFromRange()', () => {
        let range;
        let previousSibling;
        let endContainer;
        let parentContainer;
        const text = 'This is some text';

        beforeEach(() => {
            parentContainer = {
                innerHTML: text,
                insertBefore: jest.fn(),
                appendChild: jest.fn(),
                removeChild: jest.fn(),
                querySelector: jest.fn((sel) => {
                    return rootElement.querySelector(sel);
                })
            };

            previousSibling = document.createElement('div');
            previousSibling.appendChild = jest.fn();

            endContainer = {
                nodeName: '#text',
                splitText: jest.fn(),
                insertBefore: jest.fn(),
                appendChild: jest.fn(),
                previousSibling,
                parentNode: parentContainer
            };

            range = {
                endContainer,
                endOffset: 6,
                setStart: jest.fn(),
                setEnd: jest.fn()
            };

            document.createElement('span').getBoundingClientRect = jest.fn().mockReturnValue({
                right: 10,
                bottom: 11
            });
        });

        it('should split the text node by the endOffset to add the position element to', () => {
            docUtil.getDialogCoordsFromRange(range);
            expect(endContainer.splitText).toBeCalled();
        });

        describe('When end container is not a part of the text range', () => {
            beforeEach(() => {
                endContainer.nodeName = 'not text';
            });

            afterEach(() => {
                expect(endContainer.splitText).not.toBeCalled();
            });

            it('should calculate coords off of the end of the second last element in the range', () => {
                endContainer.previousElementSibling = previousSibling;
                docUtil.getDialogCoordsFromRange(range);
                expect(endContainer.previousSibling.appendChild).toBeCalled();
            });

            it('should calculate coords from the last container if no second last element in the range', () => {
                endContainer.firstChild = document.createElement('div');
                docUtil.getDialogCoordsFromRange(range);
                expect(endContainer.insertBefore).toBeCalled();
            });

            it('should calculate coords from the end of the endContainer, if no elements in the end of the range', () => {
                endContainer.previousElementSibling = undefined;
                endContainer.firstChild = undefined;
                endContainer.previousSibling = previousSibling;
                docUtil.getDialogCoordsFromRange(range);
                expect(endContainer.appendChild).toBeCalled();
            });
        });

        it('should clean out the position element from the container it was added to', () => {
            docUtil.getDialogCoordsFromRange(range);
            const dummy = parentContainer.querySelector('span');
            expect(dummy).toBeNull();
        });

        it('should use the position element\'s bounds for the x and y coordinate', () => {
            docUtil.getDialogCoordsFromRange = jest.fn().mockReturnValue({
                x: 10,
                y: 11
            });
            const coords = docUtil.getDialogCoordsFromRange(range);
            expect(coords.x).toEqual(10);
            expect(coords.y).toEqual(11);
        });
    });
});
