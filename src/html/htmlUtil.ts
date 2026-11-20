import { combineRects, getShapeRelativeToContainer } from '../highlight/highlightUtil';
import { getShape, SelectionArg } from '../store/highlight/actions';
import { Position, Rect, TargetHighlight } from '../@types';

// Rendered HTML content is treated as a single page
export const HTML_LOCATION = 1;

type TextNodeOffset = {
    node: Text;
    start: number;
};

const getTextNodes = (contentEl: HTMLElement, excludeEl?: HTMLElement | null): TextNodeOffset[] => {
    const walker = contentEl.ownerDocument.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (excludeEl?.contains(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes: TextNodeOffset[] = [];
    let start = 0;
    let node = walker.nextNode() as Text | null;

    while (node) {
        nodes.push({ node, start });
        start += node.data.length;
        node = walker.nextNode() as Text | null;
    }

    return nodes;
};

const toRange = (nodes: TextNodeOffset[], start: number, end: number): Range | null => {
    const startNode = nodes.find(({ node, start: s }) => start >= s && start < s + node.data.length);
    const endNode = nodes.find(({ node, start: s }) => end > s && end <= s + node.data.length);

    if (!startNode || !endNode) {
        return null;
    }

    const range = startNode.node.ownerDocument.createRange();
    range.setStart(startNode.node, start - startNode.start);
    range.setEnd(endNode.node, end - endNode.start);
    return range;
};

/**
 * Finds every occurrence of text across the content's text nodes, in document order.
 * Text in excludeEl (the popup portal) is skipped.
 */
export const findTextRanges = (contentEl: HTMLElement, text: string, excludeEl?: HTMLElement | null): Range[] => {
    if (!text) {
        return [];
    }

    const nodes = getTextNodes(contentEl, excludeEl);
    const fullText = nodes.map(({ node }) => node.data).join('');
    const ranges: Range[] = [];
    let index = fullText.indexOf(text);

    while (index !== -1) {
        const range = toRange(nodes, index, index + text.length);
        if (range) {
            ranges.push(range);
        }
        index = fullText.indexOf(text, index + 1);
    }

    return ranges;
};

/**
 * Returns the shapes of a text-anchored highlight, relative to the content element as it is laid out now.
 * When the text appears more than once, the match nearest the stored first shape wins.
 * Returns null when the text is not found, so the highlight renders nothing.
 */
export const getHighlightShapes = (
    contentEl: HTMLElement,
    { shapes = [], text = '' }: TargetHighlight,
    excludeEl?: HTMLElement | null,
): Rect[] | null => {
    const ranges = findTextRanges(contentEl, text, excludeEl);

    if (!ranges.length) {
        return null;
    }

    const contentShape = getShape(contentEl.getBoundingClientRect());
    const { x: storedX = 0, y: storedY = 0 } = shapes[0] ?? {};
    const getDistance = (range: Range): number => {
        const { x, y } = getShapeRelativeToContainer(getShape(range.getBoundingClientRect()), contentShape);
        return Math.hypot(x - storedX, y - storedY);
    };
    const closest = ranges.reduce((best, range) => (getDistance(range) < getDistance(best) ? range : best));

    return combineRects(Array.from(closest.getClientRects()).map(getShape)).map(rect => ({
        ...getShapeRelativeToContainer(rect, contentShape),
        type: 'rect' as const,
    }));
};

// Where a frame document's client coordinates start in this page's client coordinates: inside the frame's border
export const getFrameOffset = (ownerDocument: Document): Position => {
    const frameEl = ownerDocument === document ? null : ownerDocument.defaultView?.frameElement;

    if (!frameEl) {
        return { x: 0, y: 0 };
    }

    const { left, top } = frameEl.getBoundingClientRect();
    return { x: left + frameEl.clientLeft, y: top + frameEl.clientTop };
};

const offsetRect = ({ height, left, top, width }: DOMRect, { x, y }: Position): DOMRect =>
    ({
        bottom: top + y + height,
        height,
        left: left + x,
        right: left + x + width,
        top: top + y,
        width,
        x: left + x,
        y: top + y,
    }) as DOMRect;

/**
 * Returns the current selection when it lies inside the content element, with its text as the anchor.
 * Rects are in this page's client coordinates, since the popups that place against them render in this page even
 * when the content lives in a frame.
 */
export const getSelection = (contentEl?: HTMLElement | null): SelectionArg | null => {
    const selection = contentEl?.ownerDocument.getSelection();

    if (!contentEl || !selection || selection.isCollapsed || !selection.rangeCount) {
        return null;
    }

    const range = selection.getRangeAt(selection.rangeCount - 1);
    const text = range.toString();

    if (!contentEl.contains(range.commonAncestorContainer) || !text.trim()) {
        return null;
    }

    const offset = getFrameOffset(contentEl.ownerDocument);
    const rects = Array.from(range.getClientRects(), rect => offsetRect(rect, offset));

    return {
        containerRect: offsetRect(contentEl.getBoundingClientRect(), offset),
        location: HTML_LOCATION,
        range: Object.assign(range.cloneRange(), { getClientRects: () => rects as unknown as DOMRectList }),
        text,
    };
};

/**
 * Returns the nearest ancestor that scrolls vertically, or null when the content scrolls with its window.
 */
export const getScrollParent = (el: HTMLElement): HTMLElement | null => {
    const view = el.ownerDocument.defaultView ?? window;

    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        if (/auto|scroll|overlay/.test(view.getComputedStyle(parent).overflowY)) {
            return parent;
        }
    }

    return null;
};

/**
 * Scrolls the content's window so the point at offsets (percentages of the content box) is centered.
 */
export const scrollWindowToLocation = (contentEl: HTMLElement, { x, y }: Position): void => {
    const { defaultView, documentElement } = contentEl.ownerDocument;
    const { height, left, top, width } = contentEl.getBoundingClientRect();

    defaultView?.scrollBy(
        left + (width * x) / 100 - documentElement.clientWidth / 2,
        top + (height * y) / 100 - documentElement.clientHeight / 2,
    );
};
