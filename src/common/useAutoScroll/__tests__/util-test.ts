import * as util from '../util';

describe('useAutoScroll/util', () => {
    describe('isScrollable()', () => {
        test.each`
            overflow    | overflowX   | overflowY   | result
            ${''}       | ${''}       | ${''}       | ${false}
            ${'auto'}   | ${''}       | ${''}       | ${true}
            ${'hidden'} | ${''}       | ${''}       | ${false}
            ${'scroll'} | ${''}       | ${''}       | ${true}
            ${''}       | ${'auto'}   | ${''}       | ${true}
            ${''}       | ${'auto'}   | ${''}       | ${true}
            ${''}       | ${'scroll'} | ${''}       | ${true}
            ${''}       | ${'hidden'} | ${''}       | ${false}
            ${''}       | ${'hidden'} | ${'auto'}   | ${true}
            ${''}       | ${''}       | ${'auto'}   | ${true}
            ${''}       | ${''}       | ${'scroll'} | ${true}
            ${''}       | ${''}       | ${'hidden'} | ${false}
            ${''}       | ${'auto'}   | ${'hidden'} | ${true}
        `('should return $result based on the provided element', ({ overflow, overflowX, overflowY, result }) => {
            const el = document.createElement('div');

            el.style.overflow = overflow;
            el.style.overflowX = overflowX;
            el.style.overflowY = overflowY;

            expect(util.isScrollable(el)).toBe(result);
        });

        test('should return false if the node is not an HTML element, such as a text node', () => {
            expect(util.isScrollable(document.createTextNode('test'))).toBe(false);
        });
    });

    describe('getScrollParent()', () => {
        test('should return the first scrollable parent for a given element', () => {
            const parent = document.createElement('div');
            const child = document.createElement('div');
            parent.style.overflow = 'scroll';
            parent.appendChild(child);

            expect(util.getScrollParent(child)).toBe(parent);
        });

        test('should return the document body if no scroll parent is available', () => {
            expect(util.getScrollParent(document.createElement('div'))).toBe(document.body);
        });
    });
});
