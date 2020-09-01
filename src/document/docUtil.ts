type Selection = {
    containerRect: DOMRect;
    location: number;
    range: Range;
};

/**
 * Finds the closest ancestor DOM element with the specified class.
 */
export function findClosestElWithClass(element: Element | null, className: string): Element | null {
    for (let el = element; el && el !== document.body; el = el.parentNode as Element | null) {
        if (el.classList && el.classList.contains(className)) {
            return el;
        }
    }

    return null;
}

/**
 * Returns the page element and page number that the element is on.
 */
export function getPageNumber(element: Element | null): number | undefined {
    const pageEl = findClosestElWithClass(element, 'page');
    const pageNumber = pageEl && pageEl.getAttribute('data-page-number');

    return pageNumber ? parseInt(pageNumber, 10) : undefined;
}

export function getRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.type !== 'Range' || selection.isCollapsed || !selection.rangeCount) {
        return null;
    }

    // Firefox allows to select multiple ranges in the document by using Ctrl/Cmd+click
    // We only care about the last range
    return selection.getRangeAt(selection.rangeCount - 1);
}

export function getSelection(): Selection | null {
    const range = getRange();

    if (!range) {
        return null;
    }

    const containerEl = findClosestElWithClass(range.endContainer as Element, 'textLayer');
    const startPage = getPageNumber(range.startContainer as Element);
    const endPage = getPageNumber(range.endContainer as Element);

    if (!containerEl || !startPage || !endPage || startPage !== endPage) {
        return null;
    }

    return { containerRect: containerEl.getBoundingClientRect(), location: endPage, range };
}
