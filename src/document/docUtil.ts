import { SelectionItem } from '../store';

/**
 * Finds the closest ancestor DOM element with the specified class.
 */
export function findClosestElWithClass(element: Element | null, className: string): Element | null {
    for (let el = element; el && el !== ((document as unknown) as Element); el = el.parentNode as Element | null) {
        if (el.classList && el.classList.contains(className)) {
            return el;
        }
    }

    return null;
}

/**
 * Returns the page element and page number that the element is on.
 * If not found return null/-1
 */
export function getPageInfo(element: Element | null): { pageEl: Element | null; page: number } {
    const pageEl = findClosestElWithClass(element, 'page') || null;
    const page = parseInt((pageEl && pageEl.getAttribute('data-page-number')) || '-1', 10);

    return { pageEl, page };
}

export function getRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        return null;
    }

    return selection.getRangeAt(0);
}

export function getSelectionItem(): SelectionItem | null {
    const range = getRange();

    if (!range) {
        return null;
    }

    const { page: startPage } = getPageInfo(range.startContainer as Element);
    const { page: endPage } = getPageInfo(range.endContainer as Element);

    if (startPage < 1 || endPage < 1 || startPage !== endPage) {
        return null;
    }

    const { x, y, height, width } = range.getBoundingClientRect();

    return { location: endPage, rect: { x, y, height, width, type: 'rect' } };
}
