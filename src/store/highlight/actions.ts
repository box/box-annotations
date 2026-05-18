import { createAction } from '@reduxjs/toolkit';
import { combineRects, getBoundingRect } from '../../highlight/highlightUtil';
import { getElementLocalPosition } from '../../utils/rotate';
import { SelectionItem } from './types';
import { Shape } from '../../@types';

export type SelectionArg = {
    containerEl?: HTMLElement | null;
    containerRect: DOMRect;
    hasError?: boolean;
    location: number;
    range: Range;
    rotation?: number;
};

type Payload = {
    payload: SelectionItem | null;
};

declare global {
    interface Document {
        createNodeIterator(
            root: Node,
            whatToShow?: number,
            filter?: NodeFilter | ((node: Node) => number | null),
            entityReferenceExpansion?: boolean,
        ): NodeIterator;
    }
}

export const getClientRects = (range: Range): DOMRect[] => {
    const iterator = document.createNodeIterator(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ALL,
        function acceptNode() {
            return NodeFilter.FILTER_ACCEPT;
        },
        false,
    );

    const newRange = document.createRange();
    const rects = [];
    let currentNode = iterator.nextNode();
    while (currentNode) {
        if (rects.length === 0 && currentNode !== range.startContainer) {
            currentNode = iterator.nextNode();
            // eslint-disable-next-line no-continue
            continue;
        }

        // Only highlight Text nodes
        if (currentNode.nodeType === Node.TEXT_NODE) {
            newRange.selectNodeContents(currentNode);
            if (currentNode === range.startContainer) {
                newRange.setStart(currentNode, range.startOffset);
            }
            if (currentNode === range.endContainer) {
                newRange.setEnd(currentNode, range.endOffset);
            }
            rects.push(newRange.getBoundingClientRect());
        }

        if (currentNode === range.endContainer) {
            break;
        }

        currentNode = iterator.nextNode();
    }

    return rects;
};

export const getShape = ({ height, left, top, width }: DOMRect): Shape => ({
    height,
    width,
    x: left,
    y: top,
});

export const setSelectionAction = createAction(
    'SET_SELECTION',
    (arg: SelectionArg | null): Payload => {
        if (!arg) {
            return {
                payload: null,
            };
        }

        const { containerEl, containerRect, hasError, location, range, rotation } = arg;

        let rects = Array.from(range.getClientRects());
        // getClientRects on IE/Edge might return 0 rects
        if (!rects.length) {
            rects = getClientRects(range);
        }

        const screenShapes = rects.map(getShape);

        if (rotation && containerEl) {
            // Convert screen rects to element-local coordinates
            const localRects = screenShapes.map(shape => {
                const [lx1, ly1] = getElementLocalPosition(shape.x, shape.y, containerEl, rotation);
                const [lx2, ly2] = getElementLocalPosition(shape.x + shape.width, shape.y + shape.height, containerEl, rotation);
                return {
                    x: Math.min(lx1, lx2),
                    y: Math.min(ly1, ly2),
                    width: Math.abs(lx2 - lx1),
                    height: Math.abs(ly2 - ly1),
                };
            });

            return {
                payload: {
                    containerRect: { x: 0, y: 0, width: containerEl.offsetWidth, height: containerEl.offsetHeight },
                    hasError,
                    location,
                    popupRect: getBoundingRect(screenShapes),
                    rects: combineRects(localRects),
                },
            };
        }

        return {
            payload: {
                containerRect: getShape(containerRect),
                hasError,
                location,
                rects: combineRects(screenShapes),
            },
        };
    },
);

export const setIsPromotingAction = createAction<boolean>('SET_IS_PROMOTING');
export const setIsSelectingAction = createAction<boolean>('SET_IS_SELECTING');
