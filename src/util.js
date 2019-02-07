import 'whatwg-fetch';
import { decode } from 'box-react-ui/lib/utils/keys';
import {
    PERMISSION_ANNOTATE,
    PERMISSION_CAN_VIEW_ANNOTATIONS_ALL,
    PERMISSION_CAN_VIEW_ANNOTATIONS_SELF,
    TYPES,
    SELECTOR_ANNOTATION_CARET,
    CLASS_DISABLED,
    CLASS_HIDDEN,
    CLASS_BOX_PREVIEW_HEADER,
    SELECTOR_ANNOTATION_MODE,
    CLASS_ANNOTATION_POINT_MARKER,
    CLASS_ANNOTATION_POPOVER
} from './constants';

const HEADER_CLIENT_NAME = 'X-Box-Client-Name';
const HEADER_CLIENT_VERSION = 'X-Box-Client-Version';
/* eslint-disable no-undef */
const CLIENT_NAME = __NAME__;
const CLIENT_VERSION = __VERSION__;
/* eslint-enable no-undef */

const DESKTOP_MIN_WIDTH = 1025;

//------------------------------------------------------------------------------
// DOM Utils
//------------------------------------------------------------------------------

/**
 * Replaces the currently active header with a specified header
 *
 * @param {HTMLElement} containerEl Preview container
 * @param {string} replacementHeader Class name of new header
 * @return {void}
 */
export function replaceHeader(containerEl, replacementHeader) {
    const headerToShow = containerEl.querySelector(replacementHeader);
    if (!headerToShow) {
        return;
    }

    // First hide all possible headers
    const headers = containerEl.querySelectorAll(`.${CLASS_BOX_PREVIEW_HEADER}`);
    [].forEach.call(headers, (header) => {
        header.classList.add(CLASS_HIDDEN);
    });

    // Show the specified header
    headerToShow.classList.remove(CLASS_HIDDEN);
}

/**
 * Finds the closest ancestor DOM element with the specified class.
 *
 * @param {HTMLElement} element Element to search ancestors of
 * @param {string} className Class name to query
 * @return {HTMLElement|null} Closest ancestor with given class or null
 */
export function findClosestElWithClass(element, className) {
    for (let el = element; el && el !== document; el = el.parentNode) {
        if (el.classList && el.classList.contains(className)) {
            return el;
        }
    }

    return null;
}

/**
 * Returns the page element and page number that the element is on.
 *
 * @param {HTMLElement} element Element to find page and page number for
 * @return {Object} Page element/page number if found or null/-1 if not
 */
export function getPageInfo(element) {
    const pageEl = findClosestElWithClass(element, 'page');
    let page = 1;

    if (pageEl) {
        page = parseInt(pageEl.getAttribute('data-page-number'), 10);
    }

    return { pageEl, page };
}

/**
 * Determines whether or not the user's browser is mobile-sized
 * so they see the appropriate UI
 *
 * @param {HTMLElement} container Preview container
 * @return {boolean} Whether or not to display the mobile UI
 */
export function shouldDisplayMobileUI(container) {
    const containerRect = container.getBoundingClientRect();
    return containerRect.width < DESKTOP_MIN_WIDTH;
}

/**
 * Gets the current page element.
 *
 * @private
 * @param {HTMLElement} annotatedEl - HTML Element being annotated on
 * @param {number} pageNum - Page number
 * @return {HTMLElement|null} Page element if it exists, otherwise null
 */
export function getPageEl(annotatedEl, pageNum) {
    return annotatedEl.querySelector(`[data-page-number="${pageNum}"]`);
}

/**
 * Finds an existing annotation popover layer or creates one if it does
 * not already exist and appends the layer to the page.
 *
 * @param {HTMLElement} pageEl Page DOM Element
 * @return {HTMLElement} Annotation Popover layer DOM Element
 */
export function getPopoverLayer(pageEl) {
    let popoverLayer = pageEl.querySelector('.ba-dialog-layer');
    if (!popoverLayer) {
        popoverLayer = document.createElement('span');
        popoverLayer.classList.add('ba-dialog-layer');
        pageEl.appendChild(popoverLayer);
    }
    return popoverLayer;
}

/**
 * Finds the closest element with a data type and returns that data type. If
 * an attributeName is provided, search for that data atttribute instead of
 * data type.
 *
 * @param {HTMLElement} element Element to find closest data type for
 * @param {string} [attributeName] Optional different data attribute to search
 * for
 * @return {string} Closest data type or empty string
 */
export function findClosestDataType(element, attributeName) {
    const attributeToFind = attributeName || 'data-type';

    for (let el = element; el && el !== document; el = el.parentNode) {
        if (el && el.getAttribute(attributeToFind)) {
            return el.getAttribute(attributeToFind);
        }
    }

    return '';
}

/**
 * Shows the specified element or element with specified selector.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function showElement(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.remove(CLASS_HIDDEN);
    }
}

/**
 * Hides the specified element or element with specified selector.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function hideElement(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.add(CLASS_HIDDEN);
    }
}

/**
 * Disables the specified element or element with specified selector.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function disableElement(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.add(CLASS_DISABLED);
    }
}

/**
 * Enables the specified element or element with specified selector.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function enableElement(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.remove(CLASS_DISABLED);
    }
}

/**
 * Checks whether mouse is inside the specified DOM element
 *
 * @private
 * @param {Event} event Mouse event
 * @param {HTMLElement} el DOM element
 * @return {boolean} Whether or not mouse is inside element
 */
export function isInElement(event, el) {
    if (!el) {
        return false;
    }

    const dimensions = el.getBoundingClientRect();
    return (
        event.clientX > dimensions.left &&
        event.clientX < dimensions.right &&
        event.clientY > dimensions.top &&
        event.clientY < dimensions.bottom
    );
}

/**
 * Checks whether mouse is inside the dialog represented by this annotation.
 *
 * @private
 * @param {Event} event Mouse event
 * @param {HTMLElement} [container] Optional annotation dialog container element
 * @return {boolean} Whether or not mouse is inside dialog
 */
export function isInDialog(event, container = null) {
    if (!container) {
        return !!findClosestElWithClass(event.target, CLASS_ANNOTATION_POPOVER);
    }

    return (
        !!findClosestElWithClass(event.target, 'ba-annotator-label') ||
        !!findClosestElWithClass(event.target, 'ba-comment-list') ||
        !!findClosestElWithClass(event.target, 'ba-action-controls')
    );
}

/**
 * Checks whether mouse is inside the dialog OR annotation marker represented by this thread.
 *
 * @private
 * @param {Event} event Mouse event
 * @param {HTMLElement} [containerEl] Optional annotation dialog container element
 * @return {boolean} Whether or not mouse is inside dialog
 */
export function isInAnnotationOrMarker(event, containerEl) {
    const { target } = event;
    return !!(isInDialog(event, containerEl) || findClosestElWithClass(target, CLASS_ANNOTATION_POINT_MARKER));
}

/**
 * Creates contextual fragment
 *
 * @param {Element} node DOM node
 * @param {string} template HTML template
 * @return {DocumentFragment} Document fragment
 */
export function createFragment(node, template) {
    const range = document.createRange();
    range.selectNode(node);
    return range.createContextualFragment(template.replace(/>\s*</g, '><')); // remove new lines
}

/**
 * Inserts template string into DOM node, before beforeNode. If beforeNode is null, inserts at end of child nodes
 *
 * @param {Element} node DOM node
 * @param {string} template  html template
 * @param {Element|void} beforeNode DOM node
 * @return {void}
 */
export function insertTemplate(node, template, beforeNode = null) {
    node.insertBefore(createFragment(node, template), beforeNode);
}

/**
 * Returns zoom scale of annotated element.
 *
 * @param {HTMLElement} annotatedElement HTML element being annotated on
 * @return {number} Zoom scale
 */
export function getScale(annotatedElement) {
    return parseFloat(annotatedElement.getAttribute('data-scale')) || 1;
}

/**
 * Whether or not a highlight annotation has comments or is a plain highlight
 *
 * @param {Annotation[]} annotations Annotations in highlight thread
 * @return {boolean} Whether annotation is a plain highlight annotation
 */
export function isPlainHighlight(annotations) {
    const firstAnnotation = annotations[annotations.length - 1];
    return annotations.length === 1 && firstAnnotation.message === '';
}

/**
 * Returns whether or not the annotation type is 'highlight' or
 * 'highlight-comment'
 *
 * @param {string} type Annotatation type
 * @return {boolean} Whether or not annotation is a highlight
 */
export function isHighlightAnnotation(type) {
    return type === TYPES.highlight || type === TYPES.highlight_comment;
}

/**
 * Returns whether or not the annotation type is 'draw'
 *
 * @param {string} type Annotatation type
 * @return {boolean} Whether or not annotation is a drawing
 */
export function isDrawingAnnotation(type) {
    return type === TYPES.draw;
}

//------------------------------------------------------------------------------
// General Utils
//------------------------------------------------------------------------------

/**
 * Returns dimension scale multiplier for x and y axes calculated from comparing
 * the current annotated element dimensions scaled to 100% with annotated
 * element dimensions when annotations were created.
 *
 * @param {Object} dimensions Dimensions saved in annotation
 * @param {Object} fileDimensions Current annotated element dimensions
 * @param {number} zoomScale Zoom scale
 * @param {number} heightPadding Top & bottom padding for annotated element
 * @return {Object|null} {x, y} dimension scale if needed, null otherwise
 */
export function getDimensionScale(dimensions, fileDimensions, zoomScale, heightPadding) {
    let dimensionScale = null;

    // Scale comparing current dimensions with saved dimensions if needed
    if (dimensions && dimensions.x !== undefined && dimensions.y !== undefined) {
        const width = fileDimensions.width / zoomScale;
        const height = (fileDimensions.height - heightPadding) / zoomScale;

        // Ignore sub-pixel variations that could result from float math
        if (Math.abs(width - dimensions.x) > 1 || Math.abs(height !== dimensions.y) > 1) {
            dimensionScale = {
                x: width / dimensions.x,
                y: height / dimensions.y
            };
        }
    }

    return dimensionScale;
}

/**
 * Repositions caret if annotations popover will run off the right or left
 * side of the page. Otherwise positions caret at the center of the
 * annotations popover and the updated left corner x coordinate.
 *
 * @param  {HTMLElement} popoverEl Annotations popover element
 * @param  {number} popoverX Left corner x coordinate of the annotations popover
 * @param  {number} popoverWidth Width of the annotations popover
 * @param  {number} browserX X coordinate of the mouse position
 * @param  {number} pageWidth Width of document page
 * @return {number} Adjusted left corner x coordinate of the annotations popover
 */
export function repositionCaret(popoverEl, popoverX, popoverWidth, browserX, pageWidth) {
    // Reposition to avoid sides - left side of page is 0px, right side is
    // ${pageWidth}px
    const popoverPastLeft = popoverX < 0;
    const popoverPastRight = popoverX + popoverWidth > pageWidth;
    const annotationCaretEl = popoverEl.querySelector(SELECTOR_ANNOTATION_CARET);

    if (popoverPastLeft && !popoverPastRight) {
        // Leave a minimum of 10 pixels so caret doesn't go off edge
        const caretLeftX = Math.max(10, browserX);
        annotationCaretEl.style.left = `${caretLeftX}px`;

        return 0;
    }

    if (popoverPastRight && !popoverPastLeft) {
        // Leave a minimum of 10 pixels so caret doesn't go off edge
        const caretRightX = Math.max(10, pageWidth - browserX);

        // We set the 'left' property even when we have caretRightX for
        // IE10/11
        annotationCaretEl.style.left = `${popoverWidth - caretRightX}px`;

        return pageWidth - popoverWidth;
    }

    // Reset caret to center
    annotationCaretEl.style.left = '50%';

    return popoverX;
}

/**
 * Checks whether an annotation thread has valid min/max boundary coordinates
 *
 * @param {AnnotationThread} thread Annotation thread location object
 * @return {boolean} Whether or not the annotation has valid boundary coordinates
 */
export function hasValidBoundaryCoordinates(thread) {
    return !!(isHighlightAnnotation(thread.type) || (thread.minX && thread.minY && thread.maxX && thread.maxY));
}

/**
 * Returns a function that passes a callback a location when given an event on the document text layer
 *
 * @param {Function} locationFunction The function to get a location from an event
 * @param {Function} callback Callback to be called upon receiving an event
 * @return {Function} Event listener to convert to document location
 */
export function eventToLocationHandler(locationFunction, callback) {
    return (event) => {
        const evt = event || window.event;
        // Do nothing when the target isn't the text layer in case the text layer receives event precedence over buttons
        // NOTE: @jpress Currently only applicable to documents.
        // Need to find a better way to ensure button event precedence.
        if (!evt || (evt.target && evt.target.nodeName === 'BUTTON')) {
            return;
        }

        evt.preventDefault();
        evt.stopPropagation();
        const location = locationFunction(evt);
        callback(location);
    };
}

/**
 * Create a JSON object containing x/y coordinates and optionally dimensional information
 *
 * @param {number} x The x position of the location object
 * @param {number} y The y position of the location object
 * @param {Object} [dimensions] The dimensional information of the location object
 * @return {Object} A location object with x/y position information as well as provided dimensional information
 */
export function createLocation(x, y, dimensions) {
    const loc = { x, y };
    if (dimensions) {
        loc.dimensions = dimensions;
    }

    return loc;
}

//------------------------------------------------------------------------------
// General Util Methods
//------------------------------------------------------------------------------

/**
 * Function to decode key down events into keys
 *
 * @param {Event} event - Keydown event
 * @return {string} Decoded keydown key
 */
export function decodeKeydown(event) {
    return decode(event);
}

/**
 * Builds a list of required XHR headers.
 *
 * @param {Object} [headers] Optional headers
 * @param {string} [token] Optional auth token
 * @param {string} [sharedLink] Optional shared link
 * @param {string} [password] Optional shared link password
 * @return {Object} Headers
 */
export function getHeaders(headers = {}, token = '', sharedLink = '', password = '') {
    /* eslint-disable no-param-reassign */
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (sharedLink) {
        headers.BoxApi = `shared_link=${sharedLink}`;

        if (password) {
            headers.BoxApi = `${headers.BoxApi}&shared_link_password=${password}`;
        }
    }

    // Following headers are for API analytics
    if (CLIENT_NAME) {
        headers[HEADER_CLIENT_NAME] = CLIENT_NAME;
    }

    if (CLIENT_VERSION) {
        headers[HEADER_CLIENT_VERSION] = CLIENT_VERSION;
    }

    /* eslint-enable no-param-reassign */
    return headers;
}

/**
 * Round anumber to a certain decimal place by concatenating an exponential factor. Credits to lodash library.
 *
 * @param {number} number Thenumber to be rounded
 * @param {number} precision The amount of decimal places to keep
 * @return {number} The roundednumber
 */
export function round(number, precision) {
    /* eslint-disable prefer-template */
    let pair = (number + 'e').split('e');
    const value = Math.round(pair[0] + 'e' + (+pair[1] + precision));
    pair = (value + 'e').split('e');
    return +(pair[0] + 'e' + (+pair[1] - precision));
    /* eslint-enable prefer-template */
}

/**
 * Determines whether the user has file permissions to annotate, view (either
 * their own or everyone's) annotations which would allow annotations to at
 * least be fetched for the current file
 *
 * @param {Object} permissions File permissions
 * @return {boolean} Whether or not the user has either view OR annotate permissions
 */
export function canLoadAnnotations(permissions) {
    if (!permissions) {
        return false;
    }

    const can_annotate = permissions[PERMISSION_ANNOTATE];
    const can_view_annotations_all = permissions[PERMISSION_CAN_VIEW_ANNOTATIONS_ALL];
    const can_view_annotations_self = permissions[PERMISSION_CAN_VIEW_ANNOTATIONS_SELF];

    return !!can_annotate || !!can_view_annotations_all || !!can_view_annotations_self;
}

/**
 * Clears the specified canvas context
 *
 * @param {HTMLElement} pageEl The DOM element for the current page
 * @param {HTMLElement} layerClass The annotation canvas layer CSS class
 * @return {void}
 */
export function clearCanvas(pageEl, layerClass) {
    const annotationLayerEl = pageEl.querySelector(`canvas.${layerClass}`);
    if (!annotationLayerEl) {
        return;
    }

    const context = annotationLayerEl.getContext('2d');
    if (context) {
        context.clearRect(0, 0, annotationLayerEl.width, annotationLayerEl.height);
    }
}

/**
 * Whether or not the user is currently in an annotation mode other than the
 * specified annotation mode
 *
 * @param {HTMLElement} element The DOM element for the annotated element
 * @param {string} [mode] The specified annotation mode to check
 * @return {boolean} Whether or not the user is currently in the specified annotation mode
 */
export function isInAnnotationOrMarkerMode(element) {
    return !!element.querySelector(SELECTOR_ANNOTATION_MODE);
}

export function findElement(parent, selector, finderMethod) {
    if (!parent.querySelector(selector)) {
        finderMethod();
    }
    return parent.querySelector(selector);
}

/**
 * Given an element, determine whether it is in the upper half or lower half of the container.
 * It takes into account whether the container has a parent which is scrollable (.bp-is-scrollable)
 * in which case it determines whether the the element is in the upper or lower half of the
 * viewable area
 * @param {HTMLElement} element The element in question
 * @param {HTMLElement} containerElement The container of the element
 * @return {boolean} True if the element is in the upper half, false if in the lower half
 */
export function isInUpperHalf(element, containerElement) {
    if (!element || !containerElement) {
        return true;
    }

    let isUpperHalf = true;
    // Determine if element position is in the top or bottom half of the viewport
    // Get the height of the scrolling container (bp-is-scrollable)
    const containerEl = findClosestElWithClass(containerElement, 'bp-is-scrollable') || containerElement;
    // Get the scroll top of the scrolling container
    const { scrollTop, clientHeight } = containerEl;
    // Calculate the boundaries of the visible portion of the content
    const visibleTop = scrollTop;
    const visibleBottom = scrollTop + clientHeight;
    // determine whether point icon is in top or bottom half
    const visibleMiddle = visibleTop + (visibleBottom - visibleTop) / 2;
    // if bottom half, then subtract popover height
    isUpperHalf = element.offsetTop < visibleMiddle;

    return isUpperHalf;
}
