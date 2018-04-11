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
        /* eslint-disable prefer-arrow-callback, no-var, func-names */
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

exports.selectText = selectText;