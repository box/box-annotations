import 'whatwg-fetch';
import { decode } from 'box-react-ui/lib/utils/keys';
import {
    PERMISSION_ANNOTATE,
    PERMISSION_CAN_VIEW_ANNOTATIONS_ALL,
    PERMISSION_CAN_VIEW_ANNOTATIONS_SELF,
    TYPES,
    SELECTOR_ANNOTATION_CARET,
    PENDING_STATES,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_COMMENT_TEXT,
    CLASS_HIDDEN,
    CLASS_INVISIBLE,
    CLASS_DISABLED,
    CLASS_INVALID_INPUT,
    CLASS_ANNOTATION_DIALOG,
    CLASS_BOX_PREVIEW_HEADER,
    CLASS_DIALOG_CLOSE,
    CLASS_MOBILE_DIALOG_HEADER,
    DATA_TYPE_MOBILE_CLOSE,
    SELECTOR_ANNOTATION_MODE,
    CLASS_ANNOTATION_POINT_MARKER
} from './constants';

import { ICON_CLOSE } from './icons/icons';

const HEADER_CLIENT_NAME = 'X-Box-Client-Name';
const HEADER_CLIENT_VERSION = 'X-Box-Client-Version';
/* eslint-disable no-undef */
const CLIENT_NAME = __NAME__;
const CLIENT_VERSION = __VERSION__;
/* eslint-enable no-undef */

const THREAD_PARAMS = ['annotations', 'api', 'fileVersionId', 'locale', 'location', 'type'];
const NEWLINE_REGEX = /\r\n|\n\r|\n|\r/g;

//------------------------------------------------------------------------------
// DOM Utils
//------------------------------------------------------------------------------

/**
 * Replaces the currently active header with a specified header
 *
 * @public
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
 * Returns the page element and page Number that the element is on.
 *
 * @param {HTMLElement} element Element to find page and page Number for
 * @return {Object} Page element/page Number if found or null/-1 if not
 */
export function getPageInfo(element) {
    const pageEl = findClosestElWithClass(element, 'page') || null;
    let page = 1;

    if (pageEl) {
        page = parseInt(pageEl.getAttribute('data-page-Number'), 10);
    }

    return { pageEl, page };
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
 * Shows the specified element or element with specified selector.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function showInvisibleElement(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.remove(CLASS_INVISIBLE);
    }
}

/**
 * Hides the specified element or element with specified selector. The element
 * will still take up DOM space but not be visible in the UI.
 *
 * @param {HTMLElement|string} elementOrSelector Element or CSS selector
 * @return {void}
 */
export function hideElementVisibility(elementOrSelector) {
    let element = elementOrSelector;
    if (typeof elementOrSelector === 'string' || elementOrSelector instanceof String) {
        element = document.querySelector(elementOrSelector);
    }

    if (element) {
        element.classList.add(CLASS_INVISIBLE);
    }
}

/**
 * Reset textarea element - clears value, resets styles, and remove active
 * state.
 *
 * @param {HTMLElement} element Textarea to reset
 * @param {boolean} clearText Whether or not text in text area should be cleared
 * @return {void}
 */
export function resetTextarea(element, clearText) {
    const textareaEl = element;
    textareaEl.style.width = '';
    textareaEl.style.height = '';
    textareaEl.classList.remove(CLASS_ACTIVE);
    textareaEl.classList.remove(CLASS_INVALID_INPUT);

    if (clearText) {
        textareaEl.value = '';
    }
}

/**
 * Checks whether mouse is inside the dialog represented by this thread.
 *
 * @private
 * @param {Event} event Mouse event
 * @param {HTMLElement} [dialogEl] Optional annotation dialog element
 * @return {boolean} Whether or not mouse is inside dialog
 */
export function isInDialog(event, dialogEl) {
    return !!findClosestElWithClass(dialogEl || event.target, CLASS_ANNOTATION_DIALOG);
}

/**
 * Checks whether mouse is inside the dialog OR annotation marker represented by this thread.
 *
 * @private
 * @param {Event} event Mouse event
 * @return {boolean} Whether or not mouse is inside dialog
 */
export function isInAnnotationOrMarker(event) {
    const { target } = event;
    return !!(
        findClosestElWithClass(target, CLASS_ANNOTATION_DIALOG) ||
        findClosestElWithClass(target, CLASS_ANNOTATION_POINT_MARKER)
    );
}

/**
 * Creates contextual fragment
 *
 * @public
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
 * @public
 * @param {Element} node DOM node
 * @param {string} template  html template
 * @param {Element|void} beforeNode DOM node
 * @return {void}
 */
export function insertTemplate(node, template, beforeNode = null) {
    node.insertBefore(createFragment(node, template), beforeNode);
}

/**
 * Returns a button HTMLElement with specified information
 *
 * @public
 * @param {string[]} classNames Button CSS class
 * @param {string} title Accessibilty title
 * @param {string} content Button HTML content
 * @param {string} [dataType] Optional data type
 * @return {HTMLElement} Button
 */
export function generateBtn(classNames, title, content, dataType = '') {
    const buttonEl = document.createElement('button');
    classNames.forEach((className) => buttonEl.classList.add(className));
    buttonEl.title = title;
    buttonEl.innerHTML = content;
    buttonEl.setAttribute('data-type', dataType);
    return buttonEl;
}

//------------------------------------------------------------------------------
// Point Utils
//------------------------------------------------------------------------------

/**
 * Checks whether element is fully in viewport.
 *
 * @param {HTMLElement} element The element to check and see if it lies in the viewport
 * @return {boolean} Whether the element is fully in viewport
 */
export function isElementInViewport(element) {
    const dimensions = element.getBoundingClientRect();

    return (
        dimensions.top >= 0 &&
        dimensions.left >= 0 &&
        dimensions.bottom <= window.innerHeight &&
        dimensions.right <= window.innerWidth
    );
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

//------------------------------------------------------------------------------
// Highlight Utils
//------------------------------------------------------------------------------

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
 * Escapes HTML.
 *
 * @param {string} str Input string
 * @return {string} HTML escaped string
 */
export function htmlEscape(str) {
    return `${str}`
        .replace(/&/g, '&amp;') // first!
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

/**
 * Repositions caret if annotations dialog will run off the right or left
 * side of the page. Otherwise positions caret at the center of the
 * annotations dialog and the updated left corner x coordinate.
 *
 * @param  {HTMLElement} dialogEl Annotations dialog element
 * @param  {number} dialogX Left corner x coordinate of the annotations dialog
 * @param  {number} highlightDialogWidth Width of the annotations dialog
 * @param  {number} browserX X coordinate of the mouse position
 * @param  {number} pageWidth Width of document page
 * @return {number} Adjusted left corner x coordinate of the annotations dialog
 */
export function repositionCaret(dialogEl, dialogX, highlightDialogWidth, browserX, pageWidth) {
    // Reposition to avoid sides - left side of page is 0px, right side is
    // ${pageWidth}px
    const dialogPastLeft = dialogX < 0;
    const dialogPastRight = dialogX + highlightDialogWidth > pageWidth;
    const annotationCaretEl = dialogEl.querySelector(SELECTOR_ANNOTATION_CARET);

    if (dialogPastLeft && !dialogPastRight) {
        // Leave a minimum of 10 pixels so caret doesn't go off edge
        const caretLeftX = Math.max(10, browserX);
        annotationCaretEl.style.left = `${caretLeftX}px`;

        return 0;
    }

    if (dialogPastRight && !dialogPastLeft) {
        // Leave a minimum of 10 pixels so caret doesn't go off edge
        const caretRightX = Math.max(10, pageWidth - browserX);

        // We set the 'left' property even when we have caretRightX for
        // IE10/11
        annotationCaretEl.style.left = `${highlightDialogWidth - caretRightX}px`;

        return pageWidth - highlightDialogWidth;
    }

    // Reset caret to center
    annotationCaretEl.style.left = '50%';

    return dialogX;
}

/**
 * Checks thread is in a pending or pending-active state
 *
 * @param {string} threadState State of thread
 * @return {boolean} Whether annotation thread is in a pending state
 */
export function isPending(threadState) {
    return PENDING_STATES.indexOf(threadState) > -1;
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
 * Checks whether a point annotation thread has the correct location params
 *
 * @param {Object} location Point annotation thread location object
 * @return {boolean} Whether or not the point annotation has the correct location information
 */
export function isPointLocationValid(location) {
    return !!(location && location.x && location.y);
}

/**
 * Checks whether a highlight annotation thread has the correct location params
 *
 * @param {Object} location Highlight annotation thread location object
 * @return {boolean} Whether or not the highlight annotation has the correct location information
 */
export function isHighlightLocationValid(location) {
    return !!(location && location.quadPoints);
}

/**
 * Checks whether a draw annotation thread has the correct location params
 *
 * @param {Object} location Draw annotation thread location object
 * @return {boolean} Whether or not the draw annotation has the correct location information
 */
export function isDrawLocationValid(location) {
    return !!(location && location.minX && location.minY && location.maxX && location.maxY);
}

/**
 * Checks whether annotation thread is valid by checking whether each property
 * in THREAD_PARAMS on the specified file object is defined.
 *
 * @param {Object} thread Annotation thread params to check
 * @return {boolean} Whether or not annotation thread has all the required params
 */
export function areThreadParamsValid(thread) {
    if (thread) {
        if (
            (thread.type === TYPES.point && !isPointLocationValid(thread.location)) ||
            (isHighlightAnnotation(thread.type) && !isHighlightLocationValid(thread.location)) ||
            (thread.type === TYPES.draw && !isDrawLocationValid(thread.location))
        ) {
            return false;
        }
        return THREAD_PARAMS.every((param) => typeof thread[param] !== 'undefined');
    }
    return false;
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
 * Call preventDefault and stopPropagation on an event
 *
 * @param {event} event Event object to stop event bubbling
 * @return {void}
 */
export function prevDefAndStopProp(event) {
    if (!event) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
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
 * @public
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
 * Round a Number to a certain decimal place by concatenating an exponential factor. Credits to lodash library.
 *
 * @param {number} Number The Number to be rounded
 * @param {number} precision The amount of decimal places to keep
 * @return {number} The rounded Number
 */
export function round(Number, precision) {
    /* eslint-disable prefer-template */
    let pair = (Number + 'e').split('e');
    const value = Math.round(pair[0] + 'e' + (+pair[1] + precision));
    pair = (value + 'e').split('e');
    return +(pair[0] + 'e' + (+pair[1] - precision));
    /* eslint-enable prefer-template */
}

/**
 * Replaces variable place holders specified between {} in the string with
 * specified custom value. Localizes strings that include variables.
 *
 * @param {string} string String to be interpolated
 * @param {string[]} placeholderValues Custom values to replace into string
 * @return {string} Properly translated string with replaced custom variable
 */
export function replacePlaceholders(string, placeholderValues) {
    const regex = /\{\d+\}/g;

    if (!string || !string.length) {
        return string;
    }

    return string.replace(regex, (match) => {
        // extracting the index that is supposed to replace the matched placeholder
        const placeholderIndex = parseInt(match.replace(/^\D+/g, ''), 10) - 1;

        /* eslint-disable no-plusplus */
        return placeholderValues[placeholderIndex] ? placeholderValues[placeholderIndex] : match;
        /* eslint-enable no-plusplus */
    });
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

    const canAnnotate = permissions[PERMISSION_ANNOTATE];
    const can_view_annotations_all = permissions[PERMISSION_CAN_VIEW_ANNOTATIONS_ALL];
    const can_view_annotations_self = permissions[PERMISSION_CAN_VIEW_ANNOTATIONS_SELF];

    return !!canAnnotate || !!can_view_annotations_all || !!can_view_annotations_self;
}

/**
 * Creates a paragraph node that preserves newline characters.
 *
 * @param {string} annotationText - Text that belongs to an annotation.
 * @return {HTMLElement} An HTML Element containing newline preserved text.
 */
export function createCommentTextNode(annotationText) {
    const newlineList = annotationText.replace(NEWLINE_REGEX, '\n').split('\n');
    const textEl = document.createElement('p');
    textEl.classList.add(CLASS_ANNOTATION_COMMENT_TEXT);

    // If newlines are present...
    if (newlineList.length > 1) {
        newlineList.forEach((text) => {
            if (text === '') {
                // ...Add in <br/> for each one...
                textEl.appendChild(document.createElement('br'));
            } else {
                // ...Otherwise use the text that exists there.
                const contentEl = document.createElement('p');
                contentEl.textContent = text;
                textEl.appendChild(contentEl);
            }
        });
    } else {
        // Otherwise just use the text
        textEl.textContent = annotationText;
    }

    return textEl;
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
 * Activates appropriate textarea and adjusts the cursor position on focus
 *
 * @param {HTMLElement} element The DOM element for the current page
 * @return {HTMLElement} textAreaEl
 */
export function focusTextArea(element) {
    const textAreaEl = element;
    if (!textAreaEl) {
        return textAreaEl;
    }

    // Activate textarea
    textAreaEl.classList.add(CLASS_ACTIVE);

    // Move cursor to end of text area
    if (textAreaEl.selectionStart) {
        textAreaEl.selectionEnd = textAreaEl.value.length;
        textAreaEl.selectionStart = textAreaEl.selectionEnd;
    }

    // Focus the textarea if visible
    if (isElementInViewport(textAreaEl)) {
        textAreaEl.focus();
    }

    return textAreaEl;
}

/**
 * Generates a blank mobile annotation dialog
 *
 * @return {HTMLElement} Blank mobile annotation dialog
 */
export function generateMobileDialogEl() {
    const el = document.createElement('div');

    const headerEl = document.createElement('div');
    headerEl.classList.add(CLASS_MOBILE_DIALOG_HEADER);
    el.appendChild(headerEl);

    const closeButtonEl = generateBtn([CLASS_DIALOG_CLOSE], DATA_TYPE_MOBILE_CLOSE, ICON_CLOSE, DATA_TYPE_MOBILE_CLOSE);
    headerEl.appendChild(closeButtonEl);

    return el;
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

/**
 * Calculates the dialog width when visible
 *
 * @param {HTMLElement} dialogEl - Annotation dialog element
 * @return {number} Annotations dialog width
 */
export function getDialogWidth(dialogEl) {
    const element = dialogEl;

    // Switches to 'visibility: hidden' to ensure that dialog takes up
    // DOM space while still being invisible
    hideElementVisibility(element);
    showElement(element);

    // Ensure dialog will not be displayed off the page when
    // calculating the dialog width
    element.style.left = 0;

    const boundingRect = element.getBoundingClientRect();
    const dialogWidth = boundingRect.width;

    // Switches back to 'display: none' to so that it no longer takes up place
    // in the DOM while remaining hidden
    hideElement(element);
    showInvisibleElement(element);

    return dialogWidth;
}
