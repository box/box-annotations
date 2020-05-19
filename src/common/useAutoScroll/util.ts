const OVERFLOW_STYLE = /(auto|scroll)/;
const OVERFLOW_PROPS = ['overflow', 'overflow-x', 'overflow-y'];

export const isScrollable = (node: Node): boolean => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }

    const style = getComputedStyle(node as Element, null);
    return OVERFLOW_PROPS.some(prop => OVERFLOW_STYLE.test(style.getPropertyValue(prop)));
};

export const getScrollParent = (el: Element | null): Element => {
    if (!el || el === document.body) {
        return document.body;
    }

    // Use Element.parentNode to support accessing SVG element parents in IE11
    return isScrollable(el) ? el : getScrollParent(el.parentNode as Element);
};
