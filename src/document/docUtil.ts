type Selection = {
    canCreate: boolean;
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

export function getSelection(): Selection | null {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.focusNode) {
        return null;
    }

    // Firefox allows to select multiple ranges in the document by using Ctrl/Cmd+click
    // We only care about the last range
    let range = selection.getRangeAt(selection.rangeCount - 1);

    const containerEl = findClosestElWithClass(range.endContainer as Element, 'textLayer');
    const startPage = getPageNumber(range.startContainer as Element);
    const endPage = getPageNumber(range.endContainer as Element);

    if (!containerEl || !startPage || !endPage) {
        return null;
    }

    const canCreate = startPage === endPage;
    let location = endPage;

    if (!canCreate) {
        range = document.createRange();
        range.setEnd(selection.focusNode, selection.focusOffset);
        range.collapse(false); // Paramater toStart is not optional in IE
        location = getPageNumber(selection.focusNode as Element) ?? endPage;
    }

    return { canCreate, containerRect: containerEl.getBoundingClientRect(), location, range };
}
