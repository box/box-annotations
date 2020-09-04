import { createAction } from '@reduxjs/toolkit';
import { combineRectsByRow } from '../../highlight/highlightUtil';
import { SelectionItem } from './types';
import { Shape } from '../../@types';

export type SelectionArg = {
    containerRect: DOMRect;
    location: number;
    range: Range;
};

type Payload = {
    payload: SelectionItem | null;
};

declare global {
    interface Document {
        createNodeIterator(
            root: Node,
            whatToShow?: number,
            filter?: NodeFilter | Function,
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

        const { containerRect, location, range } = arg;

        let rects = Array.from(range.getClientRects());
        // getClientRects on IE/Edge might return 0 rects
        if (!rects.length) {
            rects = getClientRects(range);
        }

        return {
            payload: {
                containerRect: getShape(containerRect),
                location,
                rects: combineRectsByRow(rects.map(getShape)),
            },
        };
    },
);

export const setIsPromotingAction = createAction<boolean>('SET_IS_PROMOTING');
