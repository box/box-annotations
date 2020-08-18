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
