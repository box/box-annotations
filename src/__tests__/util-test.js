/* eslint-disable no-unused-expressions */
import {
    findClosestElWithClass,
    findClosestDataType,
    getPageInfo,
    showElement,
    hideElement,
    enableElement,
    disableElement,
    showInvisibleElement,
    hideElementVisibility,
    resetTextarea,
    isElementInViewport,
    getAvatarHtml,
    getScale,
    isPlainHighlight,
    isHighlightAnnotation,
    getDimensionScale,
    htmlEscape,
    repositionCaret,
    isPending,
    isPointLocationValid,
    isHighlightLocationValid,
    isDrawLocationValid,
    areThreadParamsValid,
    eventToLocationHandler,
    decodeKeydown,
    getHeaders,
    replacePlaceholders,
    createLocation,
    round,
    prevDefAndStopProp,
    canLoadAnnotations,
    insertTemplate,
    generateBtn,
    createCommentTextNode,
    clearCanvas,
    replaceHeader,
    isInDialog,
    isInAnnotationOrMarker,
    focusTextArea,
    hasValidBoundaryCoordinates,
    generateMobileDialogEl,
    getDialogWidth
} from '../util';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_COMMENT_TEXT,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_CARET,
    CLASS_ACTIVE,
    SELECTOR_MOBILE_DIALOG_HEADER,
    SELECTOR_DIALOG_CLOSE,
    SELECTOR_ANNOTATION_PLAIN_HIGHLIGHT,
    SELECTOR_ANIMATE_DIALOG,
    CLASS_HIDDEN,
    SELECTOR_ANNOTATION_POINT_MARKER
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

<div class="ba-annotation-dialog">
<div class="ba-annotation-caret"></div>
</div>

<div class="ba-point-annotation-marker"></div>

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
            expect(findClosestElWithClass(childEl, 'parent')).toEqual(parentEl);
        });

        it('should return null if no matching ancestor is found', () => {
            expect(findClosestElWithClass(childEl, 'otherParent')).toBeNull();
        });
    });

    describe('findClosestDataType()', () => {
        it('should return the data type of the closest ancestor with a data type when no attributeName is provided', () => {
            expect(findClosestDataType(childEl)).toEqual('someType');
        });

        it('should return the attribute name of the closest ancestor with the specified attributeName', () => {
            expect(findClosestDataType(childEl, 'data-name')).toEqual('someName');
        });

        it('should return empty string if no matching ancestor is found', () => {
            expect(findClosestDataType(childEl, 'data-foo')).toEqual('');
        });
    });

    describe('getPageInfo()', () => {
        it('should return page element and page number that the specified element is on', () => {
            const fooEl = rootElement.querySelector('.foo');
            const pageEl = rootElement.querySelector('.page');
            const result = getPageInfo(fooEl);
            expect(result.pageEl).toEqual(pageEl);
            expect(result.page).toEqual(2);
        });

        it('should return no page element and -1 page number if no page is found', () => {
            const barEl = rootElement.querySelector('.bar');
            const result = getPageInfo(barEl);
            expect(result.pageEl).toBeNull();
            expect(result.page).toEqual(1);
        });
    });

    describe('showElement()', () => {
        it('should remove hidden class from element with matching selector', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            showElement('.child');
            expect(childEl.classList).not.toContain('bp-is-hidden');
        });

        it('should remove hidden class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            showElement(childEl);
            expect(childEl.classList).not.toContain('bp-is-hidden');
        });
    });

    describe('hideElement()', () => {
        it('should add hidden class to matching element', () => {
            hideElement('.child');
            expect(childEl.classList).toContain('bp-is-hidden');
        });

        it('should add hidden class to provided element', () => {
            hideElement(childEl);
            expect(childEl.classList).toContain('bp-is-hidden');
        });
    });

    describe('enableElement()', () => {
        it('should remove disabled class from matching element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            enableElement('.child');
            expect(childEl.classList).not.toContain('is-disabled');
        });

        it('should remove disabled class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            enableElement(childEl);
            expect(childEl.classList).not.toContain('is-disabled');
        });
    });

    describe('disableElement()', () => {
        it('should add disabled class to matching element', () => {
            disableElement('.child');
            expect(childEl.classList).toContain('is-disabled');
        });

        it('should add disabled class to provided element', () => {
            disableElement(childEl);
            expect(childEl.classList).toContain('is-disabled');
        });
    });

    describe('showInvisibleElement()', () => {
        it('should remove invisible class from element with matching selector', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-invisible');
            showInvisibleElement('.child');
            expect(childEl.classList).not.toContain('bp-is-invisible');
        });

        it('should remove invisible class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-invisible');
            showInvisibleElement(childEl);
            expect(childEl.classList).not.toContain('bp-is-invisible');
        });
    });

    describe('hideElementVisibility()', () => {
        it('should add invisible class to matching element', () => {
            hideElementVisibility('.child');
            expect(childEl.classList).toContain('bp-is-invisible');
        });

        it('should add invisible class to provided element', () => {
            hideElementVisibility(childEl);
            expect(childEl.classList).toContain('bp-is-invisible');
        });
    });

    describe('resetTextarea()', () => {
        it('should reset text area', () => {
            const textAreaEl = rootElement.querySelector('.textarea');

            // Fake making text area 'active'
            textAreaEl.classList.add(CLASS_ACTIVE);
            textAreaEl.value = 'test';
            textAreaEl.style.width = '10px';
            textAreaEl.style.height = '10px';

            resetTextarea(textAreaEl);

            expect(textAreaEl.classList).not.toContain(CLASS_ACTIVE);
            expect(textAreaEl.classList).not.toContain('ba-invalid-input');
            expect(textAreaEl.value).toEqual('test');
            expect(textAreaEl.style.width).toEqual('');
            expect(textAreaEl.style.height).toEqual('');
        });
    });

    describe('isInDialog()', () => {
        it('should return false if no dialog element exists', () => {
            expect(isInDialog({ clientX: 8, clientY: 8 })).toBeFalsy();
        });

        it('should return true if the event is in the given dialog', () => {
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);
            expect(isInDialog({ clientX: 8, clientY: 8 }, dialogEl)).toBeTruthy();
        });
    });

    describe('isInAnnotationOrMarker()', () => {
        it('should return false if no dialog element exists', () => {
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);
            const markerEl = rootElement.querySelector(SELECTOR_ANNOTATION_POINT_MARKER);
            expect(isInAnnotationOrMarker({ target: dialogEl })).toBeTruthy();
            expect(isInAnnotationOrMarker({ target: markerEl })).toBeTruthy();
            expect(isInAnnotationOrMarker({ target: document.createElement('div') })).toBeFalsy();
        });
    });

    describe('insertTemplate()', () => {
        it('should insert template into node', () => {
            const node = document.createElement('div');
            node.insertBefore = jest.fn();
            rootElement.querySelector('.container').appendChild(node);
            document.createRange = jest.fn().mockReturnValue({
                selectNode: jest.fn(),
                createContextualFragment: jest.fn()
            });

            insertTemplate(node, '<div class="foo"></div>');
            expect(node.insertBefore).toBeCalled();
        });
    });

    describe('generateBtn()', () => {
        it('should return button node from specified details', () => {
            const btn = generateBtn(['class', 'bp-btn-plain'], 'title', document.createElement('div'), 'type');
            expect(btn.classList).not.toContain('nope');
            expect(btn.classList).toContain('bp-btn-plain');
            expect(btn.classList).toContain('class');
            expect(btn.dataset.type).toEqual('type');
            expect(btn.title).toEqual('title');
            expect(btn.innerHTML).toContain(document.createElement('div'));
        });
    });

    describe('isElementInViewport()', () => {
        it('should return true for an element fully in the viewport', () => {
            expect(isElementInViewport(childEl)).toBeTruthy();
        });
    });

    describe('getAvatarHtml()', () => {
        it('should return avatar HTML with img if avatarUrl is provided', () => {
            const expectedHtml = '<img src="https://example.com" alt="Avatar">';
            expect(getAvatarHtml('https://example.com', '1', 'Some Name', 'Avatar')).toEqual(expectedHtml);
        });

        it('should return avatar HTML initials if no avatarUrl is provided', () => {
            const expectedHtml = '<div class="ba-annotation-profile avatar-color-1">SN</div>'.trim();
            expect(getAvatarHtml('', '1', 'Some Name')).toEqual(expectedHtml);
        });
    });

    describe('getScale()', () => {
        it('should return the zoom scale stored in the data-zoom attribute for the element', () => {
            childEl.setAttribute('data-scale', 3);
            expect(getScale(childEl)).toEqual(3);
        });

        it('should return a zoom scale of 1 if no stored zoom is found on the element', () => {
            expect(getScale(childEl)).toEqual(1);
        });
    });

    describe('isPlainHighlight()', () => {
        it('should return true if highlight annotation is a plain highlight', () => {
            const annotations = [{ text: '' }];

            expect(isPlainHighlight(annotations)).toBeTruthy();
        });

        it('should return false if a plain highlight annotation had comments added to it', () => {
            const annotations = [{ text: '' }, { text: 'bleh' }];

            expect(isPlainHighlight(annotations)).toBeFalsy();
        });

        it('should return false if highlight annotation has comments', () => {
            const annotations = [{ text: 'bleh' }];

            expect(isPlainHighlight(annotations)).toBeFalsy();
        });
    });

    describe('isHighlightAnnotation()', () => {
        it('should return true if annotation is a plain highlight annotation', () => {
            expect(isHighlightAnnotation(TYPES.highlight)).toBeTruthy();
        });

        it('should return true if annotation is a highlight comment annotation', () => {
            expect(isHighlightAnnotation(TYPES.highlight_comment)).toBeTruthy();
        });

        it('should return false if annotation is a point annotation', () => {
            expect(isHighlightAnnotation(TYPES.point)).toBeFalsy();
        });
    });

    describe('getDimensionScale()', () => {
        it('should return null if no dimension scaling is needed', () => {
            const dimensions = {
                x: 100,
                y: 100
            };
            const pageDimensions = {
                width: 100,
                height: 130
            };

            const HEIGHT_PADDING = 30;
            const result = getDimensionScale(dimensions, pageDimensions, 1, HEIGHT_PADDING);
            expect(result).toBeNull();
        });

        it('should return dimension scaling factor if dimension scaling is needed', () => {
            const dimensions = {
                x: 100,
                y: 100
            };
            const pageDimensions = {
                width: 200,
                height: 230
            };

            const HEIGHT_PADDING = 30;
            const result = getDimensionScale(dimensions, pageDimensions, 1, HEIGHT_PADDING);
            expect(result.x).toEqual(2);
            expect(result.y).toEqual(2);
        });
    });

    describe('htmlEscape()', () => {
        it('should return HTML-escaped text', () => {
            expect(htmlEscape('test&file=what')).toEqual('test&amp;file=what');
            expect(htmlEscape('<script>')).toEqual('&lt;script&gt;');
            expect(htmlEscape('"string"')).toEqual('&quot;string&quot;');
            expect(htmlEscape('\'string\'')).toEqual('&#39;string&#39;');
            expect(htmlEscape('`string`')).toEqual('&#96;string&#96;');
        });
    });

    describe('repositionCaret()', () => {
        it('should position the dialog on the left edge of the page and adjust caret location accordingly', () => {
            const browserX = 1;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).toEqual(0); // dialog aligned to the left
            expect(annotationCaretEl.style.left).toEqual('10px'); // caret aligned to the left
        });

        it('should position the dialog on the right edge of the page and adjust caret location accordingly', () => {
            const browserX = 400;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).toEqual(19); // dialog aligned to the right
            expect(annotationCaretEl.style.left).toEqual('71px'); // caret aligned to the right
        });

        it('should position the caret in the center of the dialog and return top left corner coordinate', () => {
            const browserX = 100;
            const pageWidth = 1000;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).toEqual(initX); // dialog x unchanged
            expect(annotationCaretEl.style.left).toEqual('50%'); // caret centered with dialog
        });
    });

    describe('isPending()', () => {
        it('should return true if thread is pending or pending-active', () => {
            expect(isPending(STATES.pending)).toBeTruthy();
            expect(isPending(STATES.pending_active)).toBeTruthy();
        });

        it('should return false if thread is notpending', () => {
            expect(isPending(STATES.hover)).toBeFalsy();
            expect(isPending(STATES.inactive)).toBeFalsy();
        });
    });

    describe('isPointLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isPointLocationValid({})).toBeFalsy();
            expect(isPointLocationValid({ x: 1, y: 2 })).toBeTruthy();
        });
    });

    describe('isHighlightLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isHighlightLocationValid({})).toBeFalsy();
            expect(isHighlightLocationValid({ quadPoints: {} })).toBeTruthy();
        });
    });

    describe('isDrawLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isDrawLocationValid({})).toBeFalsy();
            expect(isDrawLocationValid({ minX: 1, minY: 1, maxX: 2, maxY: 2 })).toBeTruthy();
        });
    });

    describe('areThreadParamsValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(areThreadParamsValid(null)).toBeFalsy();
            expect(areThreadParamsValid({ fileVersionId: 123 })).toBeFalsy();
        });

        it('should return false if thread has invalid location', () => {
            const threadParams = {
                annotatedElement: {},
                annotations: [],
                annotationService: {},
                fileVersionId: 123,
                location: {},
                locale: 'en-US'
            };

            threadParams.type = TYPES.point;
            expect(areThreadParamsValid(threadParams)).toBeFalsy();

            threadParams.type = TYPES.highlight;
            expect(areThreadParamsValid(threadParams)).toBeFalsy();

            threadParams.type = TYPES.draw;
            expect(areThreadParamsValid(threadParams)).toBeFalsy();
        });

        it('should return true if the thread is has all expected params', () => {
            const threadParams = {
                annotatedElement: {},
                annotations: [],
                annotationService: {},
                fileVersionId: 123,
                location: { x: 1, y: 2 },
                locale: 'en-US',
                type: TYPES.point
            };
            expect(areThreadParamsValid(threadParams)).toBeTruthy();
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
            locationHandler = eventToLocationHandler(getLocation, callback);
            event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
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
                nodeName: 'BUTTON'
            };
            locationHandler(event);
            expect(callback).not.toBeCalled();
        });
    });

    describe('prevDefAndStopProp()', () => {
        it('should prevent default and stop propagation on an event', () => {
            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            prevDefAndStopProp(event);
            expect(event.preventDefault).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
        });
    });

    describe('createLocation()', () => {
        it('should create a location object without dimensions', () => {
            const location = createLocation(1, 2, undefined);
            expect(location).toStrictEqual({
                x: 1,
                y: 2
            });
        });

        it('should create a location object with dimensions', () => {
            const dimensionalObj = 'dimensional object';
            const location = createLocation(1, 2, dimensionalObj);
            expect(location).toStrictEqual({
                x: 1,
                y: 2,
                dimensions: dimensionalObj
            });
        });
    });

    describe('decodeKeydown()', () => {
        it('should return empty when no key', () => {
            expect(decodeKeydown({ key: '' })).toEqual('');
        });

        it('should return empty when modifier and key are same', () => {
            expect(decodeKeydown({ key: 'Control', ctrlKey: true })).toEqual('');
        });

        it('should return correct with ctrl modifier', () => {
            expect(decodeKeydown({ key: '1', ctrlKey: true })).toEqual('Control+1');
        });

        it('should return correct with shift modifier', () => {
            expect(decodeKeydown({ key: '1', shiftKey: true })).toEqual('Shift+1');
        });

        it('should return correct with meta modifier', () => {
            expect(decodeKeydown({ key: '1', metaKey: true })).toEqual('Meta+1');
        });

        it('should return space key', () => {
            expect(decodeKeydown({ key: ' ' })).toEqual('Space');
        });

        it('should return right arrow key', () => {
            expect(decodeKeydown({ key: 'Right' })).toEqual('ArrowRight');
        });

        it('should return left arrow key', () => {
            expect(decodeKeydown({ key: 'Left' })).toEqual('ArrowLeft');
        });

        it('should return up arrow key', () => {
            expect(decodeKeydown({ key: 'Up' })).toEqual('ArrowUp');
        });

        it('should return down arrow key', () => {
            expect(decodeKeydown({ key: 'Down' })).toEqual('ArrowDown');
        });

        it('should return esc key', () => {
            expect(decodeKeydown({ key: 'U+001B' })).toEqual('Escape');
        });

        it('should decode correct UTF8 key', () => {
            expect(decodeKeydown({ key: 'U+0041' })).toEqual('A');
        });
    });

    /* eslint-disable no-undef */
    describe('getHeaders()', () => {
        it('should return correct headers', () => {
            const sharedLink = 'https://sharename';
            const fooHeader = 'bar';
            const token = 'someToken';
            const headers = getHeaders({ foo: fooHeader }, token, sharedLink);
            expect(headers.foo).toEqual(fooHeader);
            expect(headers.Authorization).toEqual(`Bearer ${token}`);
            expect(headers.BoxApi).toEqual(`shared_link=${sharedLink}`);
            expect(headers['X-Box-Client-Name']).toEqual(__NAME__);
            expect(headers['X-Box-Client-Version']).toEqual(__VERSION__);
        });

        it('should return correct headers with password', () => {
            const headers = getHeaders({ foo: 'bar' }, 'token', 'https://sharename', 'password');
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
            expect(round(floatNum, 0)).toEqual(Math.ceil(floatNum));
            expect(round(floatNum, 1)).toEqual(123456789.9);
            expect(round(floatNum, 2)).toEqual(123456789.89);
            expect(round(floatNum, 3)).toEqual(123456789.888);
            expect(round(floatNum, 4)).toEqual(123456789.8877);
        });
    });
    describe('replacePlaceholders()', () => {
        it('should replace only the placeholder with the custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted', ['Bob'])).toEqual('Bob highlighted');
        });

        it('should replace all placeholders with the custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted {2}', ['Bob', 'Suzy'])).toEqual('Bob highlighted Suzy');
        });

        it('should replace only placeholders that have custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted {2}', ['Bob'])).toEqual('Bob highlighted {2}');
        });

        it('should respect the order of placeholders when given an arbitrary order', () => {
            expect(replacePlaceholders('{2} highlighted {1}', ['Bob', 'Suzy'])).toEqual('Suzy highlighted Bob');
        });

        it('should replace with the same value if the placeholder is repeated', () => {
            expect(replacePlaceholders('{2} highlighted {2}', ['Bob', 'Suzy'])).toEqual('Suzy highlighted Suzy');
        });
    });

    describe('canLoadAnnotations()', () => {
        let permissions;

        beforeEach(() => {
            permissions = {
                can_annotate: false,
                can_view_annotations_all: false,
                can_view_annotations_self: false
            };
        });

        it('should return false if permissions do not exist', () => {
            expect(canLoadAnnotations()).toBeFalsy();
        });

        it('should return true if user has at least can_annotate permissions', () => {
            permissions.can_annotate = true;
            expect(canLoadAnnotations(permissions)).toBeTruthy();
        });

        it('should return true if user has at least can_view_annotations_all permissions', () => {
            permissions.can_view_annotations_all = true;
            expect(canLoadAnnotations(permissions)).toBeTruthy();
        });

        it('should return true if user has at least can_view_annotations_self permissions', () => {
            permissions.can_view_annotations_self = true;
            expect(canLoadAnnotations(permissions)).toBeTruthy();
        });
    });

    describe('createCommentTextNode()', () => {
        it('should add a <br> for each newline', () => {
            const text = `


            yay, three breaks!`;

            const textEl = createCommentTextNode(text);

            const breaks = textEl.querySelectorAll('br');
            expect(breaks.length === 3).toBeTruthy();
        });

        it('should add a <p> containing text for mixed newline/text', () => {
            const text = 'some breaks \n and \n text';
            const textEl = createCommentTextNode(text);

            const paras = textEl.querySelectorAll('p');
            expect(paras.length === 3).toBeTruthy();
        });

        it('should use the text as textContent if no newlines', () => {
            const text = 'no breaks and some text';
            const textEl = createCommentTextNode(text);

            const paras = textEl.querySelectorAll('p');
            expect(paras.length === 0).toBeTruthy();
            expect(textEl.textContent).toEqual(text);
        });

        it('should add the comment text class to the element created', () => {
            const text = 'no breaks and some text';
            const textEl = createCommentTextNode(text);

            expect(textEl.classList.contains(CLASS_ANNOTATION_COMMENT_TEXT)).toBeTruthy();
        });
    });

    describe('clearCanvas()', () => {
        let layerEl;
        let context;

        beforeEach(() => {
            layerEl = {
                width: 500,
                height: 500,
                getContext: jest.fn()
            };

            context = {
                clearRect: jest.fn()
            };
        });

        it('should do nothing if the annotation layer does not exist', () => {
            clearCanvas(document.createElement('div'), 'anything');
            expect(context.clearRect).not.toBeCalled();
        });

        it('should clear the specified annotation layer', () => {
            const pageEl = {
                querySelector: jest.fn().mockReturnValue(layerEl)
            };
            layerEl.getContext = jest.fn().mockReturnValue(context);
            clearCanvas(pageEl, 'anything');
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
            replaceHeader(containerEl, '.bp-invalid-header');
            expect(baseHeader.classList).not.toContain('bp-is-hidden');
            expect(newHeader.classList).toContain('bp-is-hidden');
        });

        it('should hide all headers and then show the specified header', () => {
            replaceHeader(containerEl, '.bp-mode-header');
            expect(baseHeader.classList).toContain('bp-is-hidden');
            expect(newHeader.classList).not.toContain('bp-is-hidden');
        });
    });

    describe('focusTextArea()', () => {
        it('should activate the textarea', () => {
            const el = document.createElement('div');
            expect(focusTextArea(el).classList).toContain(CLASS_ACTIVE);
        });
    });

    describe('hasValidBoundaryCoordinates()', () => {
        it('return true only if boundary coordinates are valid', () => {
            expect(hasValidBoundaryCoordinates({})).toBeFalsy();
            expect(
                hasValidBoundaryCoordinates({
                    minX: NaN,
                    minY: 1,
                    maxX: 1,
                    maxY: 1
                })
            ).toBeFalsy();
            expect(
                hasValidBoundaryCoordinates({
                    minX: 1,
                    minY: 1,
                    maxX: 1,
                    maxY: 1
                })
            ).toBeTruthy();
        });

        it('should return true for highlight annotations', () => {
            expect(hasValidBoundaryCoordinates({ type: TYPES.highlight })).toBeTruthy();
        });
    });

    describe('generateMobileDialogEl()', () => {
        it('should return a blank mobile dialog', () => {
            const el = generateMobileDialogEl();
            expect(el.querySelector(SELECTOR_MOBILE_DIALOG_HEADER)).not.toBeNull();
            expect(el.querySelector(SELECTOR_DIALOG_CLOSE)).not.toBeNull();
            expect(el.querySelector(SELECTOR_ANNOTATION_PLAIN_HIGHLIGHT)).toBeNull();
            expect(el.querySelector(SELECTOR_ANIMATE_DIALOG)).toBeNull();
        });
    });

    describe('getDialogWidth', () => {
        it('should calculate dialog width without displaying the dialog', () => {
            const dialogEl = rootElement.querySelector(SELECTOR_ANNOTATION_DIALOG);
            dialogEl.getBoundingClientRect = jest.fn().mockReturnValue({
                width: 100
            });
            expect(getDialogWidth(dialogEl)).toEqual(100);
            expect(dialogEl.classList).toContain(CLASS_HIDDEN);
        });
    });
});
