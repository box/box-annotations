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
    getFirstAnnotation,
    getLastAnnotation,
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
    CLASS_MOBILE_DIALOG_HEADER,
    CLASS_DIALOG_CLOSE,
    CLASS_ANNOTATION_PLAIN_HIGHLIGHT,
    CLASS_ANIMATE_DIALOG,
    CLASS_HIDDEN,
    SELECTOR_ANNOTATION_POINT_MARKER
} from '../constants';

const DIALOG_WIDTH = 81;

const sandbox = sinon.sandbox.create();
const stubs = {};

describe('util', () => {
    let childEl;
    let parentEl;

    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('__tests__/util-test.html');

        childEl = document.querySelector('.child');
        parentEl = document.querySelector('.parent');
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        fixture.cleanup();
    });

    describe('findClosestElWithClass()', () => {
        it('should return closest ancestor element with the specified class', () => {
            expect(findClosestElWithClass(childEl, 'parent')).to.equal(parentEl);
        });

        it('should return null if no matching ancestor is found', () => {
            expect(findClosestElWithClass(childEl, 'otherParent')).to.be.null;
        });
    });

    describe('findClosestDataType()', () => {
        it('should return the data type of the closest ancestor with a data type when no attributeName is provided', () => {
            expect(findClosestDataType(childEl)).to.equal('someType');
        });

        it('should return the attribute name of the closest ancestor with the specified attributeName', () => {
            expect(findClosestDataType(childEl, 'data-name')).to.equal('someName');
        });

        it('should return empty string if no matching ancestor is found', () => {
            expect(findClosestDataType(childEl, 'data-foo')).to.equal('');
        });
    });

    describe('getPageInfo()', () => {
        it('should return page element and page number that the specified element is on', () => {
            const fooEl = document.querySelector('.foo');
            const pageEl = document.querySelector('.page');
            const result = getPageInfo(fooEl);
            expect(result.pageEl).to.equal(pageEl);
            expect(result.page).to.equal(2);
        });

        it('should return no page element and -1 page number if no page is found', () => {
            const barEl = document.querySelector('.bar');
            const result = getPageInfo(barEl);
            expect(result.pageEl).to.be.null;
            expect(result.page).to.equal(1);
        });
    });

    describe('showElement()', () => {
        it('should remove hidden class from element with matching selector', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            showElement('.child');
            expect(childEl).to.not.have.class('bp-is-hidden');
        });

        it('should remove hidden class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-hidden');
            showElement(childEl);
            expect(childEl).to.not.have.class('bp-is-hidden');
        });
    });

    describe('hideElement()', () => {
        it('should add hidden class to matching element', () => {
            hideElement('.child');
            expect(childEl).to.have.class('bp-is-hidden');
        });

        it('should add hidden class to provided element', () => {
            hideElement(childEl);
            expect(childEl).to.have.class('bp-is-hidden');
        });
    });

    describe('enableElement()', () => {
        it('should remove disabled class from matching element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            enableElement('.child');
            expect(childEl).to.not.have.class('is-disabled');
        });

        it('should remove disabled class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('is-disabled');
            enableElement(childEl);
            expect(childEl).to.not.have.class('is-disabled');
        });
    });

    describe('disableElement()', () => {
        it('should add disabled class to matching element', () => {
            disableElement('.child');
            expect(childEl).to.have.class('is-disabled');
        });

        it('should add disabled class to provided element', () => {
            disableElement(childEl);
            expect(childEl).to.have.class('is-disabled');
        });
    });

    describe('showInvisibleElement()', () => {
        it('should remove invisible class from element with matching selector', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-invisible');
            showInvisibleElement('.child');
            expect(childEl).to.not.have.class('bp-is-invisible');
        });

        it('should remove invisible class from provided element', () => {
            // Hide element before testing show function
            childEl.classList.add('bp-is-invisible');
            showInvisibleElement(childEl);
            expect(childEl).to.not.have.class('bp-is-invisible');
        });
    });

    describe('hideElementVisibility()', () => {
        it('should add invisible class to matching element', () => {
            hideElementVisibility('.child');
            expect(childEl).to.have.class('bp-is-invisible');
        });

        it('should add invisible class to provided element', () => {
            hideElementVisibility(childEl);
            expect(childEl).to.have.class('bp-is-invisible');
        });
    });

    describe('resetTextarea()', () => {
        it('should reset text area', () => {
            const textAreaEl = document.querySelector('.textarea');

            // Fake making text area 'active'
            textAreaEl.classList.add(CLASS_ACTIVE);
            textAreaEl.value = 'test';
            textAreaEl.style.width = '10px';
            textAreaEl.style.height = '10px';

            resetTextarea(textAreaEl);

            expect(textAreaEl).to.not.have.class(CLASS_ACTIVE);
            expect(textAreaEl).to.not.have.class('ba-invalid-input');
            expect(textAreaEl.value).to.equal('test');
            expect(textAreaEl.style.width).to.equal('');
            expect(textAreaEl.style.height).to.equal('');
        });
    });

    describe('isInDialog()', () => {
        it('should return false if no dialog element exists', () => {
            expect(isInDialog({ clientX: 8, clientY: 8 })).to.be.false;
        });

        it('should return true if the event is in the given dialog', () => {
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);
            expect(isInDialog({ clientX: 8, clientY: 8 }, dialogEl)).to.be.true;
        });
    });

    describe('isInAnnotationOrMarker()', () => {
        it('should return false if no dialog element exists', () => {
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);
            const markerEl = document.querySelector(SELECTOR_ANNOTATION_POINT_MARKER);
            expect(isInAnnotationOrMarker({ target: dialogEl })).to.be.true;
            expect(isInAnnotationOrMarker({ target: markerEl })).to.be.true;
            expect(isInAnnotationOrMarker({ target: document.createElement() })).to.be.false;
        });
    });

    describe('insertTemplate()', () => {
        it('should insert template into node', () => {
            const node = document.createElement('div');
            document.querySelector('.container').appendChild(node);

            insertTemplate(node, '<div class="foo"></div>');
            expect(node.firstElementChild).to.have.class('foo');
        });
    });

    describe('generateBtn()', () => {
        it('should return button node from specified details', () => {
            const btn = generateBtn(['class', 'bp-btn-plain'], 'title', document.createElement('div'), 'type');
            expect(btn).to.not.have.class('nope');
            expect(btn).to.have.class('bp-btn-plain');
            expect(btn).to.have.class('class');
            expect(btn).to.have.attribute('data-type', 'type');
            expect(btn).to.have.attribute('title', 'title');
            expect(btn).to.contain.html(document.createElement('div'));
        });
    });

    describe('isElementInViewport()', () => {
        it('should return true for an element fully in the viewport', () => {
            expect(isElementInViewport(childEl)).to.be.true;
        });

        it('should return false for an element not fully in the viewport', () => {
            // Fake child element not being in viewport
            childEl.style.position = 'absolute';
            childEl.style.left = '-10px';
            expect(isElementInViewport(childEl)).to.be.false;
        });
    });

    describe('getAvatarHtml()', () => {
        it('should return avatar HTML with img if avatarUrl is provided', () => {
            const expectedHtml = '<img src="https://example.com" alt="Avatar">';
            expect(getAvatarHtml('https://example.com', '1', 'Some Name', 'Avatar')).to.equal(expectedHtml);
        });

        it('should return avatar HTML initials if no avatarUrl is provided', () => {
            const expectedHtml = '<div class="ba-annotation-profile avatar-color-1">SN</div>'.trim();
            expect(getAvatarHtml('', '1', 'Some Name')).to.equal(expectedHtml);
        });
    });

    describe('getScale()', () => {
        it('should return the zoom scale stored in the data-zoom attribute for the element', () => {
            childEl.setAttribute('data-scale', 3);
            expect(getScale(childEl)).to.equal(3);
        });

        it('should return a zoom scale of 1 if no stored zoom is found on the element', () => {
            expect(getScale(childEl)).to.equal(1);
        });
    });

    describe('getFirstAnnotation()', () => {
        it('should return the first annotation in thread', () => {
            const annotations = {
                def123: { id: 1 },
                abc456: { id: 2 }
            };
            expect(getFirstAnnotation(annotations)).to.deep.equal({ id: 1 });
        });
    });

    describe('getLastAnnotation()', () => {
        it('should return the last annotation in thread', () => {
            const annotations = {
                def123: { id: 1 },
                abc456: { id: 2 }
            };
            expect(getLastAnnotation(annotations)).to.deep.equal({ id: 2 });
        });
    });

    describe('isPlainHighlight()', () => {
        it('should return true if highlight annotation is a plain highlight', () => {
            const annotations = [{ text: '' }];

            expect(isPlainHighlight(annotations)).to.be.true;
        });

        it('should return false if a plain highlight annotation had comments added to it', () => {
            const annotations = [{ text: '' }, { text: 'bleh' }];

            expect(isPlainHighlight(annotations)).to.be.false;
        });

        it('should return false if highlight annotation has comments', () => {
            const annotations = [{ text: 'bleh' }];

            expect(isPlainHighlight(annotations)).to.be.false;
        });
    });

    describe('isHighlightAnnotation()', () => {
        it('should return true if annotation is a plain highlight annotation', () => {
            expect(isHighlightAnnotation(TYPES.highlight)).to.be.true;
        });

        it('should return true if annotation is a highlight comment annotation', () => {
            expect(isHighlightAnnotation(TYPES.highlight_comment)).to.be.true;
        });

        it('should return false if annotation is a point annotation', () => {
            expect(isHighlightAnnotation(TYPES.point)).to.be.false;
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
            expect(result).to.be.null;
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
            expect(result.x).to.equal(2);
            expect(result.y).to.equal(2);
        });
    });

    describe('htmlEscape()', () => {
        it('should return HTML-escaped text', () => {
            expect(htmlEscape('test&file=what')).to.equal('test&amp;file=what');
            expect(htmlEscape('<script>')).to.equal('&lt;script&gt;');
            expect(htmlEscape('"string"')).to.equal('&quot;string&quot;');
            expect(htmlEscape('\'string\'')).to.equal('&#39;string&#39;');
            expect(htmlEscape('`string`')).to.equal('&#96;string&#96;');
        });
    });

    describe('repositionCaret()', () => {
        it('should position the dialog on the left edge of the page and adjust caret location accordingly', () => {
            const browserX = 1;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).to.equal(0); // dialog aligned to the left
            expect(annotationCaretEl.style.left).to.equal('10px'); // caret aligned to the left
        });

        it('should position the dialog on the right edge of the page and adjust caret location accordingly', () => {
            const browserX = 400;
            const pageWidth = 100;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).to.equal(19); // dialog aligned to the right
            expect(annotationCaretEl.style.left).to.equal('71px'); // caret aligned to the right
        });

        it('should position the caret in the center of the dialog and return top left corner coordinate', () => {
            const browserX = 100;
            const pageWidth = 1000;
            const initX = browserX - DIALOG_WIDTH / 2;
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);

            const dialogX = repositionCaret(dialogEl, initX, DIALOG_WIDTH, browserX, pageWidth);

            const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);
            expect(dialogX).to.equal(initX); // dialog x unchanged
            expect(annotationCaretEl.style.left).to.equal('50%'); // caret centered with dialog
        });
    });

    describe('isPending()', () => {
        it('should return true if thread is pending or pending-active', () => {
            expect(isPending(STATES.pending)).to.be.true;
            expect(isPending(STATES.pending_active)).to.be.true;
        });

        it('should return false if thread is notpending', () => {
            expect(isPending(STATES.hover)).to.be.false;
            expect(isPending(STATES.inactive)).to.be.false;
        });
    });

    describe('isPointLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isPointLocationValid({})).to.be.false;
            expect(isPointLocationValid({ x: 1, y: 2 })).to.be.true;
        });
    });

    describe('isHighlightLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isHighlightLocationValid({})).to.be.false;
            expect(isHighlightLocationValid({ quadPoints: {} })).to.be.true;
        });
    });

    describe('isDrawLocationValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(isDrawLocationValid({})).to.be.false;
            expect(isDrawLocationValid({ minX: 1, minY: 1, maxX: 2, maxY: 2 })).to.be.true;
        });
    });

    describe('areThreadParamsValid()', () => {
        it('should return false if the thread is null or missing any expected params', () => {
            expect(areThreadParamsValid(null)).to.be.false;
            expect(areThreadParamsValid({ fileVersionId: 123 })).to.be.false;
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
            expect(areThreadParamsValid(threadParams)).to.be.false;

            threadParams.type = TYPES.highlight;
            expect(areThreadParamsValid(threadParams)).to.be.false;

            threadParams.type = TYPES.draw;
            expect(areThreadParamsValid(threadParams)).to.be.false;
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
            expect(areThreadParamsValid(threadParams)).to.be.true;
        });
    });

    describe('eventToLocationHandler()', () => {
        let getLocation;
        let callback;
        let locationHandler;
        let event;

        beforeEach(() => {
            getLocation = () => 'location';
            callback = sandbox.stub();
            locationHandler = eventToLocationHandler(getLocation, callback);
            event = {
                preventDefault: () => {},
                stopPropagation: () => {}
            };
        });

        it('should not call the callback when the location is valid', () => {
            locationHandler(undefined);
            expect(callback).to.not.be.called;
        });

        it('should call the callback when the location is valid', () => {
            locationHandler(event);
            expect(callback).to.be.calledWith('location');
        });

        it('should do nothing when the target exists and it is not the textLayer', () => {
            event.target = {
                nodeName: 'BUTTON'
            };
            locationHandler(event);
            expect(callback).to.not.be.called;
        });
    });

    describe('prevDefAndStopProp()', () => {
        it('should prevent default and stop propagation on an event', () => {
            const event = {
                preventDefault: sandbox.stub(),
                stopPropagation: sandbox.stub()
            };

            prevDefAndStopProp(event);
            expect(event.preventDefault).to.be.called;
            expect(event.stopPropagation).to.be.called;
        });
    });

    describe('createLocation()', () => {
        it('should create a location object without dimensions', () => {
            const location = createLocation(1, 2, undefined);
            expect(location).to.deep.equal({
                x: 1,
                y: 2
            });
        });

        it('should create a location object with dimensions', () => {
            const dimensionalObj = 'dimensional object';
            const location = createLocation(1, 2, dimensionalObj);
            expect(location).to.deep.equal({
                x: 1,
                y: 2,
                dimensions: dimensionalObj
            });
        });
    });

    describe('decodeKeydown()', () => {
        it('should return empty when no key', () => {
            expect(decodeKeydown({ key: '' })).to.equal('');
        });

        it('should return empty when modifier and key are same', () => {
            expect(decodeKeydown({ key: 'Control', ctrlKey: true })).to.equal('');
        });

        it('should return correct with ctrl modifier', () => {
            expect(decodeKeydown({ key: '1', ctrlKey: true })).to.equal('Control+1');
        });

        it('should return correct with shift modifier', () => {
            expect(decodeKeydown({ key: '1', shiftKey: true })).to.equal('Shift+1');
        });

        it('should return correct with meta modifier', () => {
            expect(decodeKeydown({ key: '1', metaKey: true })).to.equal('Meta+1');
        });

        it('should return space key', () => {
            expect(decodeKeydown({ key: ' ' })).to.equal('Space');
        });

        it('should return right arrow key', () => {
            expect(decodeKeydown({ key: 'Right' })).to.equal('ArrowRight');
        });

        it('should return left arrow key', () => {
            expect(decodeKeydown({ key: 'Left' })).to.equal('ArrowLeft');
        });

        it('should return up arrow key', () => {
            expect(decodeKeydown({ key: 'Up' })).to.equal('ArrowUp');
        });

        it('should return down arrow key', () => {
            expect(decodeKeydown({ key: 'Down' })).to.equal('ArrowDown');
        });

        it('should return esc key', () => {
            expect(decodeKeydown({ key: 'U+001B' })).to.equal('Escape');
        });

        it('should decode correct UTF8 key', () => {
            expect(decodeKeydown({ key: 'U+0041' })).to.equal('A');
        });
    });

    /* eslint-disable no-undef */
    describe('getHeaders()', () => {
        it('should return correct headers', () => {
            const sharedLink = 'https://sharename';
            const fooHeader = 'bar';
            const token = 'someToken';
            const headers = getHeaders({ foo: fooHeader }, token, sharedLink);
            expect(headers.foo).to.equal(fooHeader);
            expect(headers.Authorization).to.equal(`Bearer ${token}`);
            expect(headers.BoxApi).to.equal(`shared_link=${sharedLink}`);
            expect(headers['X-Box-Client-Name']).to.equal(__NAME__);
            expect(headers['X-Box-Client-Version']).to.equal(__VERSION__);
        });

        it('should return correct headers with password', () => {
            const headers = getHeaders({ foo: 'bar' }, 'token', 'https://sharename', 'password');
            expect(headers.foo).to.equal('bar');
            expect(headers.Authorization).to.equal('Bearer token');
            expect(headers.BoxApi).to.equal('shared_link=https://sharename&shared_link_password=password');
            expect(headers['X-Box-Client-Name']).to.equal(__NAME__);
            expect(headers['X-Box-Client-Version']).to.equal(__VERSION__);
        });
    });

    describe('round()', () => {
        it('should round to the correct decimal precision', () => {
            const floatNum = 123456789.887654321;
            expect(round(floatNum, 0)).to.equal(Math.ceil(floatNum));
            expect(round(floatNum, 1)).to.equal(123456789.9);
            expect(round(floatNum, 2)).to.equal(123456789.89);
            expect(round(floatNum, 3)).to.equal(123456789.888);
            expect(round(floatNum, 4)).to.equal(123456789.8877);
        });
    });
    describe('replacePlaceholders()', () => {
        it('should replace only the placeholder with the custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted', ['Bob'])).to.equal('Bob highlighted');
        });

        it('should replace all placeholders with the custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted {2}', ['Bob', 'Suzy'])).to.equal('Bob highlighted Suzy');
        });

        it('should replace only placeholders that have custom value in the given string', () => {
            expect(replacePlaceholders('{1} highlighted {2}', ['Bob'])).to.equal('Bob highlighted {2}');
        });

        it('should respect the order of placeholders when given an arbitrary order', () => {
            expect(replacePlaceholders('{2} highlighted {1}', ['Bob', 'Suzy'])).to.equal('Suzy highlighted Bob');
        });

        it('should replace with the same value if the placeholder is repeated', () => {
            expect(replacePlaceholders('{2} highlighted {2}', ['Bob', 'Suzy'])).to.equal('Suzy highlighted Suzy');
        });
    });

    describe('canLoadAnnotations()', () => {
        beforeEach(() => {
            stubs.permissions = {
                can_annotate: false,
                can_view_annotations_all: false,
                can_view_annotations_self: false
            };
        });

        it('should return false if permissions do not exist', () => {
            expect(canLoadAnnotations()).to.be.false;
        });

        it('should return true if user has at least can_annotate permissions', () => {
            stubs.permissions.can_annotate = true;
            expect(canLoadAnnotations(stubs.permissions)).to.be.true;
        });

        it('should return true if user has at least can_view_annotations_all permissions', () => {
            stubs.permissions.can_view_annotations_all = true;
            expect(canLoadAnnotations(stubs.permissions)).to.be.true;
        });

        it('should return true if user has at least can_view_annotations_self permissions', () => {
            stubs.permissions.can_view_annotations_self = true;
            expect(canLoadAnnotations(stubs.permissions)).to.be.true;
        });
    });

    describe('createCommentTextNode()', () => {
        it('should add a <br> for each newline', () => {
            const text = `


            yay, three breaks!`;

            const textEl = createCommentTextNode(text);

            const breaks = textEl.querySelectorAll('br');
            expect(breaks.length === 3).to.be.true;
        });

        it('should add a <p> containing text for mixed newline/text', () => {
            const text = 'some breaks \n and \n text';
            const textEl = createCommentTextNode(text);

            const paras = textEl.querySelectorAll('p');
            expect(paras.length === 3).to.be.true;
        });

        it('should use the text as textContent if no newlines', () => {
            const text = 'no breaks and some text';
            const textEl = createCommentTextNode(text);

            const paras = textEl.querySelectorAll('p');
            expect(paras.length === 0).to.be.true;
            expect(textEl.textContent).to.equal(text);
        });

        it('should add the comment text class to the element created', () => {
            const text = 'no breaks and some text';
            const textEl = createCommentTextNode(text);

            expect(textEl.classList.contains(CLASS_ANNOTATION_COMMENT_TEXT)).to.be.true;
        });
    });

    describe('clearCanvas()', () => {
        beforeEach(() => {
            stubs.layerEl = {
                width: 500,
                height: 500,
                getContext: () => {}
            };
            stubs.layerMock = sandbox.mock(stubs.layerEl);

            stubs.context = {
                clearRect: () => {}
            };
            stubs.contextMock = sandbox.mock(stubs.context);
        });

        it('should do nothing if the annotation layer does not exist', () => {
            stubs.contextMock.expects('clearRect').never();
            clearCanvas(document.createElement('div'), 'anything');
        });

        it('should clear the specified annotation layer', () => {
            const pageEl = {
                querySelector: sandbox.stub().returns(stubs.layerEl)
            };
            stubs.layerMock.expects('getContext').returns(stubs.context);
            stubs.contextMock.expects('clearRect').once();
            clearCanvas(pageEl, 'anything');
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
            expect(baseHeader).to.not.have.class('bp-is-hidden');
            expect(newHeader).to.have.class('bp-is-hidden');
        });

        it('should hide all headers and then show the specified header', () => {
            replaceHeader(containerEl, '.bp-mode-header');
            expect(baseHeader).to.have.class('bp-is-hidden');
            expect(newHeader).to.not.have.class('bp-is-hidden');
        });
    });

    describe('focusTextArea()', () => {
        it('should activate the textarea', () => {
            const el = document.createElement('div');
            expect(focusTextArea(el)).to.have.class(CLASS_ACTIVE);
        });
    });

    describe('hasValidBoundaryCoordinates()', () => {
        it('return true only if boundary coordinates are valid', () => {
            expect(hasValidBoundaryCoordinates({})).to.be.false;
            expect(
                hasValidBoundaryCoordinates({
                    minX: NaN,
                    minY: 1,
                    maxX: 1,
                    maxY: 1
                })
            ).to.be.false;
            expect(
                hasValidBoundaryCoordinates({
                    minX: 1,
                    minY: 1,
                    maxX: 1,
                    maxY: 1
                })
            ).to.be.true;
        });

        it('should return true for highlight annotations', () => {
            expect(hasValidBoundaryCoordinates({ type: TYPES.highlight })).to.be.true;
        });
    });

    describe('generateMobileDialogEl()', () => {
        it('should return a blank mobile dialog', () => {
            const el = generateMobileDialogEl();
            expect(el).to.have.descendant(`.${CLASS_MOBILE_DIALOG_HEADER}`);
            expect(el).to.have.descendant(`.${CLASS_DIALOG_CLOSE}`);
            expect(el).to.not.have.class(`.${CLASS_ANNOTATION_PLAIN_HIGHLIGHT}`);
            expect(el).to.not.have.class(`.${CLASS_ANIMATE_DIALOG}`);
        });
    });

    describe('getDialogWidth', () => {
        it('should calculate dialog width without displaying the dialog', () => {
            const dialogEl = document.querySelector(SELECTOR_ANNOTATION_DIALOG);
            dialogEl.style.width = '100px';
            expect(getDialogWidth(dialogEl)).to.equal(100);
            expect(dialogEl).to.have.class(CLASS_HIDDEN);
        });
    });
});
