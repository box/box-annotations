/* eslint-disable no-unused-expressions */
import * as util from '../util';
import {
    TYPES,
    SELECTOR_ANNOTATION_POPOVER,
    CLASS_ANNOTATION_CARET,
    SELECTOR_ANNOTATION_POINT_MARKER,
    CLASS_ANNOTATION_POPOVER,
    CLASS_ANNOTATION_POINT_MARKER,
} from '../constants';

const DIALOG_WIDTH = 81;
const html = `<div class="wrapper" data-name="someName">
<div class="parent" data-type="someType">
    <div class="child"></div>
</div>
</div>

<textarea class="textarea"></textarea>

<div class="page" data-page-number="2">
<div class="foo"></div>
</div>

<div class="${CLASS_ANNOTATION_POPOVER}">
<div class="${CLASS_ANNOTATION_CARET}"></div>
</div>

<div class="${CLASS_ANNOTATION_POINT_MARKER}"></div>

<div class="container"></div>
`;

describe('util', () => {
    let childEl;
    let parentEl;
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        childEl = rootElement.querySelector('.child');
        parentEl = rootElement.querySelector('.parent');
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
    });

    describe('findClosestElWithClass()', () => {
        it('should return closest ancestor element with the specified class', () => {
            expect(util.findClosestElWithClass(childEl, 'parent')).toEqual(parentEl);
        });

        it('should return null if no matching ancestor is found', () => {
            expect(util.findClosestElWithClass(childEl, 'otherParent')).toBeNull();
        });
    });

    describe('findClosestDataType()', () => {
        it('should return the data type of the closest ancestor with a data type when no attributeName is provided', () => {
            expect(util.findClosestDataType(childEl)).toEqual('someType');
        });

        it('should return the attribute name of the closest ancestor with the specified attributeName', () => {
            expect(util.findClosestDataType(childEl, 'data-name')).toEqual('someName');
        });

        it('should return empty string if no matching ancestor is found', () => {
            expect(util.findClosestDataType(childEl, 'data-foo')).toEqual('');
        });
    });

    describe('getPageInfo()', () => {
        it('should return page element and page number that the specified element is on', () => {
            const fooEl = rootElement.querySelector('.foo');
            const pageEl = rootElement.querySelector('.page');
            const result = util.getPageInfo(fooEl);
            expect(result.pageEl).toEqual(pageEl);
            expect(result.page).toEqual(2);
        });

        it('should return no page element and -1 page number if no page is found', () => {
            const barEl = rootElement.querySelector('.bar');
            const result = util.getPageInfo(barEl);
            expect(result.pageEl).toBeNull();
            expect(result.page).toEqual(1);
        });
    });

    describe('showElement()', () => {
        it('should remove hidden class from element with matching selector', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            util.showElement('.child');
            expect(childEl.classList).not.toContain('bp-is-hidden');
        });

        it('should remove hidden class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            util.showElement(childEl);
            expect(childEl.classList).not.toContain('bp-is-hidden');
        });
    });

    describe('hideElement()', () => {
        it('should add hidden class to matching element', () => {
            util.hideElement('.child');
            expect(childEl.classList).toContain('bp-is-hidden');
        });

        it('should add hidden class to provided element', () => {
            util.hideElement(childEl);
            expect(childEl.classList).toContain('bp-is-hidden');
        });
    });

    describe('enableElement()', () => {
        it('should remove disabled class from matching element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            util.enableElement('.child');
            expect(childEl.classList).not.toContain('is-disabled');
        });

        it('should remove disabled class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            util.enableElement(childEl);
            expect(childEl.classList).not.toContain('is-disabled');
        });
    });

    describe('disableElement()', () => {
        it('should add disabled class to matching element', () => {
            util.disableElement('.child');
            expect(childEl.classList).toContain('is-disabled');
        });

        it('should add disabled class to provided element', () => {
            util.disableElement(childEl);
            expect(childEl.classList).toContain('is-disabled');
        });
    });

    describe('isInDialog()', () => {
        it('should return false if no dialog element exists', () => {
            expect(util.findClosestElWithClass()).toBeFalsy();
        });

        it('should return true if the event is in the given dialog', () => {
            const actionControls = document.createElement('div');
            actionControls.classList.add('ba-action-controls');
            rootElement.appendChild(actionControls);
            expect(util.isInDialog({ target: actionControls }, rootElement)).toBeTruthy();
        });
    });

    describe('isInAnnotationOrMarker()', () => {
        it('should return false if no dialog element exists', () => {
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_POPOVER);
            const markerEl = rootElement.querySelector(SELECTOR_ANNOTATION_POINT_MARKER);
            expect(util.isInAnnotationOrMarker({ target: dialogEl })).toBeTruthy();
            expect(util.isInAnnotationOrMarker({ target: markerEl })).toBeTruthy();
            expect(util.isInAnnotationOrMarker({ target: document.createElement('div') })).toBeFalsy();
        });
    });

    describe('insertTemplate()', () => {
        it('should insert template into node', () => {
            const node = document.createElement('div');
            node.insertBefore = jest.fn();
            rootElement.querySelector('.container').appendChild(node);
            document.createRange = jest.fn().mockReturnValue({
                selectNode: jest.fn(),
                createContextualFragment: jest.fn(),
            });

            util.insertTemplate(node, '<div class="foo"></div>');
            expect(node.insertBefore).toBeCalled();
        });
    });

    describe('getScale()', () => {
        it('should return the zoom scale stored in the data-zoom attribute for the element', () => {
            childEl.setAttribute('data-scale', 3);
            expect(util.getScale(childEl)).toEqual(3);
        });

        it('should return a zoom scale of 1 if no stored zoom is found on the element', () => {
            expect(util.getScale(childEl)).toEqual(1);
        });
    });

    describe('isPlainHighlight()', () => {
        it('should return true if highlight annotation is a plain highlight', () => {
            const annotations = [{ message: '' }];

            expect(util.isPlainHighlight(annotations)).toBeTruthy();
        });

        it('should return false if a plain highlight annotation had comments added to it', () => {
            const annotations = [{ message: '' }, { message: 'bleh' }];

            expect(util.isPlainHighlight(annotations)).toBeFalsy();
        });

        it('should return false if highlight annotation has comments', () => {
            const annotations = [{ message: 'bleh' }];

            expect(util.isPlainHighlight(annotations)).toBeFalsy();
        });
    });

    describe('isHighlightAnnotation()', () => {
        it('should return true if annotation is a plain highlight annotation', () => {
            expect(util.isHighlightAnnotation(TYPES.highlight)).toBeTruthy();
        });

        it('should return true if annotation is a highlight comment annotation', () => {
            expect(util.isHighlightAnnotation(TYPES.highlight_comment)).toBeTruthy();
        });

        it('should return false if annotation is a point annotation', () => {
            expect(util.isHighlightAnnotation(TYPES.point)).toBeFalsy();
        });
    });

    describe('getDimensionScale()', () => {
        it('should return null if no dimension scaling is needed', () => {
            const dimensions = {
                x: 100,
                y: 100,
            };
            const pageDimensions = {
                width: 100,
                height: 130,
            };

            const HEIGHT_PADDING = 30;
            const result = util.getDimensionScale(dimensions, pageDimensions, 1, HEIGHT_PADDING);
            expect(result).toBeNull();
        });

        it('should return dimension scaling factor if dimension scaling is needed', () => {
            const dimensions = {
                x: 100,
                y: 100,
            };
            const pageDimensions = {
                width: 200,
                height: 230,
            };

            const HEIGHT_PADDING = 30;
            const result = util.getDimensionScale(dimensions, pageDimensions, 1, HEIGHT_PADDING);
            expect(result.x).toEqual(2);
            expect(result.y).toEqual(2);
        });
    });

    describe('repositionCaret()', () => {
        it('should position the dialog on the left edge of the page and adjust caret location accordingly', () => {
            const browserX = 1;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;

            const dialogX = util.repositionCaret(rootElement, initX, DIALOG_WIDTH, browserX, pageWidth);
            expect(dialogX).toEqual(0); // dialog aligned to the left
        });

        it('should position the dialog on the right edge of the page and adjust caret location accordingly', () => {
            const browserX = 400;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;

            const dialogX = util.repositionCaret(rootElement, initX, DIALOG_WIDTH, browserX, pageWidth);
            expect(dialogX).toEqual(19); // dialog aligned to the right
        });

        it('should position the caret in the center of the dialog and return top left corner coordinate', () => {
            const browserX = 100;
            const pageWidth = 1000;
            const initX = browserX - DIALOG_WIDTH / 2;

            const dialogX = util.repositionCaret(rootElement, initX, DIALOG_WIDTH, browserX, pageWidth);
            expect(dialogX).toEqual(initX); // dialog x unchanged
        });
    });

    describe('getPageEl()', () => {
        it('should return the result of querySelector', () => {
            const page = 2;
            const truePageEl = document.querySelector(`.page[data-page-number="${page}"]`);
            rootElement.appendChild(truePageEl);

            const pageEl = util.getPageEl(rootElement, page);
            expect(pageEl).toEqual(truePageEl);
        });
    });

    describe('eventToLocationHandler()', () => {
        let getLocation;
        let callback;
        let locationHandler;
        let event;

        beforeEach(() => {
            getLocation = () => 'location';
            callback = jest.fn();
            locationHandler = util.eventToLocationHandler(getLocation, callback);
            event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            };
        });

        it('should not call the callback when the location is valid', () => {
            locationHandler(undefined);
            expect(callback).not.toBeCalled();
        });

        it('should call the callback when the location is valid', () => {
            locationHandler(event);
            expect(callback).toBeCalledWith('location');
        });

        it('should do nothing when the target exists and it is not the textLayer', () => {
            event.target = {
                nodeName: 'BUTTON',
            };
            locationHandler(event);
            expect(callback).not.toBeCalled();
        });
    });

    describe('createLocation()', () => {
        it('should create a location object without dimensions', () => {
            const location = util.createLocation(1, 2, undefined);
            expect(location).toStrictEqual({
                x: 1,
                y: 2,
            });
        });

        it('should create a location object with dimensions', () => {
            const dimensionalObj = 'dimensional object';
            const location = util.createLocation(1, 2, dimensionalObj);
            expect(location).toStrictEqual({
                x: 1,
                y: 2,
                dimensions: dimensionalObj,
            });
        });
    });

    describe('decodeKeydown()', () => {
        it('should return empty when no key', () => {
            expect(util.decodeKeydown({ key: '' })).toEqual('');
        });

        it('should return empty when modifier and key are same', () => {
            expect(util.decodeKeydown({ key: 'Control', ctrlKey: true })).toEqual('');
        });

        it('should return correct with ctrl modifier', () => {
            expect(util.decodeKeydown({ key: '1', ctrlKey: true })).toEqual('Control+1');
        });

        it('should return correct with shift modifier', () => {
            expect(util.decodeKeydown({ key: '1', shiftKey: true })).toEqual('Shift+1');
        });

        it('should return correct with meta modifier', () => {
            expect(util.decodeKeydown({ key: '1', metaKey: true })).toEqual('Meta+1');
        });

        it('should return space key', () => {
            expect(util.decodeKeydown({ key: ' ' })).toEqual('Space');
        });

        it('should return right arrow key', () => {
            expect(util.decodeKeydown({ key: 'Right' })).toEqual('ArrowRight');
        });

        it('should return left arrow key', () => {
            expect(util.decodeKeydown({ key: 'Left' })).toEqual('ArrowLeft');
        });

        it('should return up arrow key', () => {
            expect(util.decodeKeydown({ key: 'Up' })).toEqual('ArrowUp');
        });

        it('should return down arrow key', () => {
            expect(util.decodeKeydown({ key: 'Down' })).toEqual('ArrowDown');
        });

        it('should return esc key', () => {
            expect(util.decodeKeydown({ key: 'U+001B' })).toEqual('Escape');
        });

        it('should decode correct UTF8 key', () => {
            expect(util.decodeKeydown({ key: 'U+0041' })).toEqual('A');
        });
    });

    /* eslint-disable no-undef */
    describe('getHeaders()', () => {
        it('should return correct headers', () => {
            const sharedLink = 'https://sharename';
            const fooHeader = 'bar';
            const token = 'someToken';
            const headers = util.getHeaders({ foo: fooHeader }, token, sharedLink);
            expect(headers.foo).toEqual(fooHeader);
            expect(headers.Authorization).toEqual(`Bearer ${token}`);
            expect(headers.BoxApi).toEqual(`shared_link=${sharedLink}`);
            expect(headers['X-Box-Client-Name']).toEqual(__NAME__);
            expect(headers['X-Box-Client-Version']).toEqual(__VERSION__);
        });

        it('should return correct headers with password', () => {
            const headers = util.getHeaders({ foo: 'bar' }, 'token', 'https://sharename', 'password');
            expect(headers.foo).toEqual('bar');
            expect(headers.Authorization).toEqual('Bearer token');
            expect(headers.BoxApi).toEqual('shared_link=https://sharename&shared_link_password=password');
            expect(headers['X-Box-Client-Name']).toEqual(__NAME__);
            expect(headers['X-Box-Client-Version']).toEqual(__VERSION__);
        });
    });

    describe('round()', () => {
        it('should round to the correct decimal precision', () => {
            const floatNum = 123456789.887654321;
            expect(util.round(floatNum, 0)).toEqual(Math.ceil(floatNum));
            expect(util.round(floatNum, 1)).toEqual(123456789.9);
            expect(util.round(floatNum, 2)).toEqual(123456789.89);
            expect(util.round(floatNum, 3)).toEqual(123456789.888);
            expect(util.round(floatNum, 4)).toEqual(123456789.8877);
        });
    });

    describe('clearCanvas()', () => {
        let layerEl;
        let context;

        beforeEach(() => {
            layerEl = {
                width: 500,
                height: 500,
                getContext: jest.fn(),
            };

            context = {
                clearRect: jest.fn(),
            };
        });

        it('should do nothing if the annotation layer does not exist', () => {
            util.clearCanvas(document.createElement('div'), 'anything');
            expect(context.clearRect).not.toBeCalled();
        });

        it('should clear the specified annotation layer', () => {
            const pageEl = {
                querySelector: jest.fn().mockReturnValue(layerEl),
            };
            layerEl.getContext = jest.fn().mockReturnValue(context);
            util.clearCanvas(pageEl, 'anything');
            expect(context.clearRect).toHaveBeenCalledTimes(1);
        });
    });

    describe('replaceHeader()', () => {
        const newHeader = document.createElement('div');
        const containerEl = document.createElement('div');
        const baseHeader = document.createElement('div');

        beforeEach(() => {
            baseHeader.className = 'bp-header';
            containerEl.appendChild(baseHeader);

            newHeader.className = 'bp-header bp-mode-header bp-is-hidden';
            containerEl.appendChild(newHeader);
        });

        it('should do nothing if no valid header is specified', () => {
            util.replaceHeader(containerEl, '.bp-invalid-header');
            expect(baseHeader.classList).not.toContain('bp-is-hidden');
            expect(newHeader.classList).toContain('bp-is-hidden');
        });

        it('should hide all headers and then show the specified header', () => {
            util.replaceHeader(containerEl, '.bp-mode-header');
            expect(baseHeader.classList).toContain('bp-is-hidden');
            expect(newHeader.classList).not.toContain('bp-is-hidden');
        });
    });

    describe('hasValidBoundaryCoordinates()', () => {
        it('return true only if boundary coordinates are valid', () => {
            expect(util.hasValidBoundaryCoordinates({})).toBeFalsy();
            expect(
                util.hasValidBoundaryCoordinates({
                    minX: NaN,
                    minY: 1,
                    maxX: 1,
                    maxY: 1,
                }),
            ).toBeFalsy();
            expect(
                util.hasValidBoundaryCoordinates({
                    minX: 1,
                    minY: 1,
                    maxX: 1,
                    maxY: 1,
                }),
            ).toBeTruthy();
        });

        it('should return true for highlight annotations', () => {
            expect(util.hasValidBoundaryCoordinates({ type: TYPES.highlight })).toBeTruthy();
        });
    });

    describe('isInUpperHalf()', () => {
        test('Should return true if element is falsy', () => {
            expect(util.isInUpperHalf(undefined, {})).toBe(true);
        });

        it('Should return true if containerElement is falsy', () => {
            expect(util.isInUpperHalf({})).toBe(true);
        });

        it('Should return true if element is in top half', () => {
            const element = { offsetTop: 0 };
            const containerElement = { clientHeight: 100, scrollTop: 0 };
            util.findClosestElWithClass = jest.fn();
            expect(util.isInUpperHalf(element, containerElement)).toBe(true);
        });

        it('Should return false if element is in bottom half', () => {
            const element = { offsetTop: 60 };
            const containerElement = { clientHeight: 100, scrollTop: 0 };
            util.findClosestElWithClass = jest.fn();
            expect(util.isInUpperHalf(element, containerElement)).toBe(false);
        });

        it('Should return true if element is in top half of scrollable view', () => {
            const element = { offsetTop: 55 };
            const containerElement = { clientHeight: 200, scrollTop: 0 };
            const scrollableElement = { clientHeight: 100, scrollTop: 50 };
            util.findClosestElWithClass = jest.fn().mockReturnValue(scrollableElement);
            expect(util.isInUpperHalf(element, containerElement)).toBe(true);
        });

        it('Should return false if element is in bottom half of scrollable view', () => {
            const element = { offsetTop: 105 };
            const containerElement = { clientHeight: 200, scrollTop: 0 };
            const scrollableElement = { clientHeight: 100, scrollTop: 50 };
            util.findClosestElWithClass = jest.fn().mockReturnValue(scrollableElement);
            expect(util.isInUpperHalf(element, containerElement)).toBe(false);
        });
    });
});
