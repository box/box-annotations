/* eslint-disable prefer-arrow-callback, no-var, func-names */

/**
 * Selects text on the document
 *
 * @param {Object} I - the codeceptjs I
 * @param {string} selector - the selector to use
 *
 * @return {void}
 */
function selectText(I, selector) {
    I.waitForElement(selector);

    I.executeScript(
        function (sel) {
            const preview = document.querySelector('.bp-doc');
            const selectionEl = document.querySelector(sel);
            const start = selectionEl.firstElementChild;
            const end = selectionEl.lastElementChild;

            const selection = window.getSelection();
            selection.removeAllRanges();

            /**
             * Cross browser event creation
             * @param {string} eventName the event name
             * @param {HTMLElement} el - the DOM element to use
             * @return {Event} the event
             */
            function createNewEvent(eventName, el) {
                const x = el.offsetLeft + 2;
                const y = el.offsetTop + 2;

                let event;
                if (typeof MouseEvent === 'function') {
                    event = new MouseEvent(eventName, {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    });
                }

                return event;
            }

            preview.dispatchEvent(createNewEvent('mousedown', start));
            preview.dispatchEvent(createNewEvent('mousemove', end));
            selection.setBaseAndExtent(start, 0, end, 0);
            preview.dispatchEvent(createNewEvent('mouseup', end));
        },
        selector
    );
}

/**
 * Selects text on the document
 *
 * @param {Object} I - the codeceptjs I
 * @param {string} action - mouseEvent action type
 * @param {string} selector - the selector to use
 * @param {number} offset - mouseEvent offset
 *
 * @return {void}
 */
function executeMouseEvent(I, action, selector, offset) {
    I.waitForElement(selector);

    I.executeScript(
        function (sel, mouseEvt, off) {
            const preview = document.querySelector('.bp-doc');
            const selectionEl = document.querySelector(sel);
            const element = selectionEl.firstElementChild ? selectionEl.firstElementChild : selectionEl;

            /**
             * Cross browser event creation
             * @param {string} eventName the event name
             * @param {HTMLElement} el - the DOM element to use
             * @return {Event} the event
             */
            function createNewEvent(eventName, el) {
                const x = el.offsetLeft + off;
                const y = el.offsetTop + off;

                let event;
                if (typeof MouseEvent === 'function') {
                    event = new MouseEvent(eventName, {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    });
                }

                return event;
            }

            preview.dispatchEvent(createNewEvent(mouseEvt, element));
        },
        selector,
        action,
        offset
    );
}

exports.executeMouseEvent = executeMouseEvent;
exports.selectText = selectText;

exports.draw = function(I, selector, offset) {
    var pos = 0;
    const MAX_OFFSET = 300;

    executeMouseEvent(I, 'mousedown', selector, 0);

    for(pos = 0; pos <= MAX_OFFSET; pos += offset) {
        executeMouseEvent(I, 'mousemove', selector, pos);
    }

    executeMouseEvent(I, 'mouseup', selector, MAX_OFFSET);
};

exports.clickAtLocation = function(I, selector, offset) {
    executeMouseEvent(I, 'click', selector, offset);
};
