import { SelectionItem } from '../store';

/**
 * Finds the closest ancestor DOM element with the specified class.
 */
export function findClosestElWithClass(element: HTMLElement | null, className: string): HTMLElement | null {
    for (
        let el = element;
        el && el !== ((document as unknown) as HTMLElement);
        el = el.parentNode as HTMLElement | null
    ) {
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
export function getPageInfo(element: HTMLElement): { pageEl: HTMLElement | null; page: number } {
    const pageEl = findClosestElWithClass(element, 'page') || null;
    const page = parseInt((pageEl && pageEl.getAttribute('data-page-number')) || '-1', 10);

    return { pageEl, page };
}

export function getRange(): Range | null {
    const selection = window.getSelection();
    if (!selection?.anchorNode || !selection?.focusNode) {
        return null;
    }
    const range = selection.getRangeAt(0);

    return range.collapsed ? null : range;
}

export function getSelectionItem(): SelectionItem | null {
    const range = getRange();

    if (!range) {
        return null;
    }

    const { page: startPage } = getPageInfo(range.startContainer as HTMLElement);
    const { page: endPage } = getPageInfo(range.endContainer as HTMLElement);

    if (startPage !== endPage) {
        return null;
    }

    const { x, y, height, width } = range.getBoundingClientRect();

    return { location: endPage, rect: { x, y, height, width, type: 'rect' } };
}
