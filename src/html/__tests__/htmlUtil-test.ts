import { findTextRanges, getHighlightShapes, getScrollParent, getSelection } from '../htmlUtil';
import { TargetHighlight } from '../../@types';
import { TARGET_TYPE } from '../../constants';

// jsdom has no layout: place each range by the data-top of its paragraph, and 10px right per character of offset
const getRangeRect = (range: Range): DOMRect => {
    const top = Number((range.startContainer.parentElement?.closest('[data-top]') as HTMLElement)?.dataset.top);
    const left = 100 + range.startOffset * 10;
    return { bottom: top + 20, height: 20, left, right: left + 200, top, width: 200, x: left, y: top } as DOMRect;
};
const mockRangeLayout = (RangeClass: typeof Range): void => {
    RangeClass.prototype.getBoundingClientRect = function getBoundingClientRect() {
        return getRangeRect(this);
    };
    RangeClass.prototype.getClientRects = function getClientRects() {
        return [getRangeRect(this)] as unknown as DOMRectList;
    };
};

describe('html/htmlUtil', () => {
    const contentEl = document.createElement('div');
    const getTarget = (target: Partial<TargetHighlight>): TargetHighlight => ({
        location: { type: TARGET_TYPE.PAGE, value: 1 },
        shapes: [],
        type: 'highlight',
        ...target,
    });

    beforeAll(() => {
        mockRangeLayout(Range);
    });

    beforeEach(() => {
        contentEl.innerHTML = `
            <p data-top="100">Hello <b>wor</b>ld</p>
            <p data-top="300">target and target</p>
            <p data-top="500">Hello world</p>
            <div class="ba-PopupPortal"><span>Hello world</span></div>
        `;
        document.body.appendChild(contentEl);
        jest.spyOn(contentEl, 'getBoundingClientRect').mockReturnValue({
            height: 1000,
            left: 0,
            top: 0,
            width: 1000,
            x: 0,
            y: 0,
        } as DOMRect);
    });

    afterEach(() => {
        contentEl.remove();
        window.getSelection()?.removeAllRanges();
    });

    const getPortal = (): HTMLElement => contentEl.querySelector('.ba-PopupPortal') as HTMLElement;

    describe('findTextRanges()', () => {
        test('should find text that spans several text nodes', () => {
            const ranges = findTextRanges(contentEl, 'lo world', getPortal());

            expect(ranges.map(range => range.toString())).toEqual(['lo world', 'lo world']);
        });

        test('should skip text inside the excluded element', () => {
            expect(findTextRanges(contentEl, 'Hello world', getPortal())).toHaveLength(2);
            expect(findTextRanges(contentEl, 'Hello world')).toHaveLength(3);
        });

        test('should return nothing for empty or missing text', () => {
            expect(findTextRanges(contentEl, '')).toEqual([]);
            expect(findTextRanges(contentEl, 'missing')).toEqual([]);
        });
    });

    describe('getHighlightShapes()', () => {
        test('should return shapes relative to the content element', () => {
            expect(getHighlightShapes(contentEl, getTarget({ text: 'Hello world' }), getPortal())).toEqual([
                { height: 2, type: 'rect', width: 20, x: 10, y: 10 },
            ]);
        });

        test('should pick the match nearest the stored first shape', () => {
            const target = getTarget({ shapes: [{ height: 2, type: 'rect', width: 20, x: 16, y: 45 }], text: 'world' });

            expect(getHighlightShapes(contentEl, target, getPortal())).toEqual([
                { height: 2, type: 'rect', width: 20, x: 16, y: 50 },
            ]);
        });

        test.each`
            storedX | expectedX
            ${10}   | ${10}
            ${20}   | ${21}
        `('should pick the match at x $expectedX for a word repeated on one line', ({ storedX, expectedX }) => {
            const target = getTarget({
                shapes: [{ height: 2, type: 'rect', width: 20, x: storedX, y: 30 }],
                text: 'target',
            });

            expect(getHighlightShapes(contentEl, target)).toEqual([
                { height: 2, type: 'rect', width: 20, x: expectedX, y: 30 },
            ]);
        });

        test.each([undefined, '', 'missing'])('should return null when the text is %p', text => {
            expect(getHighlightShapes(contentEl, getTarget({ text }), getPortal())).toBeNull();
        });
    });

    describe('getSelection()', () => {
        const select = (node: Node, start: number, end: number): void => {
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, end);
            window.getSelection()?.addRange(range);
        };

        test('should return the selection with its text on page 1, in client coordinates', () => {
            select(contentEl.querySelectorAll('p')[2].firstChild as Node, 0, 5);

            const selection = getSelection(contentEl);

            expect(selection).toMatchObject({ containerRect: { left: 0, top: 0 }, location: 1, text: 'Hello' });
            expect(Array.from(selection?.range.getClientRects() ?? [])).toEqual([
                expect.objectContaining({ left: 100, top: 500 }),
            ]);
        });

        test('should return null when nothing is selected', () => {
            expect(getSelection(contentEl)).toBeNull();
        });

        test('should return null when the selection is outside the content element', () => {
            const outsideEl = document.createElement('p');
            outsideEl.textContent = 'outside';
            document.body.appendChild(outsideEl);
            select(outsideEl.firstChild as Node, 0, 3);

            expect(getSelection(contentEl)).toBeNull();
            outsideEl.remove();
        });

        test('should return null without a content element', () => {
            expect(getSelection(null)).toBeNull();
        });
    });

    describe('getScrollParent()', () => {
        test('should return the nearest scrolling ancestor', () => {
            const scrollEl = document.createElement('div');
            scrollEl.style.overflowY = 'auto';
            scrollEl.appendChild(contentEl);
            document.body.appendChild(scrollEl);

            expect(getScrollParent(contentEl)).toBe(scrollEl);
            scrollEl.remove();
        });

        test('should return null when no ancestor scrolls', () => {
            expect(getScrollParent(contentEl)).toBeNull();
        });
    });
});
