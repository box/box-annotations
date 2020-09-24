import { findClosestElWithClass, getPageNumber, getSelection } from '../docUtil';

describe('docUtil', () => {
    describe('findClosestElWithClass()', () => {
        it('should return closest ancestor element with the specified class', () => {
            const rootElement = document.createElement('div');

            rootElement.innerHTML = `
                <div class="parent">
                    <div class="child" />
                </div>`;
            document.body.appendChild(rootElement);

            const childEl: HTMLElement | null = rootElement.querySelector('.child');
            const parentEl = rootElement.querySelector('.parent');

            expect(findClosestElWithClass(childEl, 'parent')).toEqual(parentEl);
            expect(findClosestElWithClass(childEl, 'otherParent')).toBeNull();
        });
    });

    describe('getPageInfo()', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
                <div class="page" data-page-number="2">
                    <div class="foo" />
                </div>`;

        it('should return page number that the specified element is on', () => {
            const fooEl = rootElement.querySelector('.foo');
            expect(getPageNumber(fooEl)).toEqual(2);
        });

        it('should return undefined if no page is found', () => {
            const barEl = rootElement.querySelector('.bar');
            expect(getPageNumber(barEl)).toBeUndefined();
        });
    });

    describe('getSelection()', () => {
        const rootElement = document.createElement('div');
        rootElement.classList.add('textLayer');
        rootElement.innerHTML = `
            <div class="range0" />
            <div class="page" data-page-number="1">
                <div class="range1" />
            </div>
            <div class="page" data-page-number="2">
                <div class="range2" />
            </div>
        `;

        const generateSelection = (startClass: string, endClass: string): Selection => {
            return ({
                focusNode: rootElement.querySelector(endClass),
                getRangeAt: () => {
                    const range = document.createRange();
                    range.setStart(rootElement.querySelector(startClass) as Node, 0);
                    range.setEnd(rootElement.querySelector(endClass) as Node, 0);
                    range.getBoundingClientRect = jest.fn().mockReturnValueOnce({});
                    range.getClientRects = jest.fn().mockReturnValueOnce([]);
                    return range;
                },
                rangeCount: 1,
                type: 'Range',
            } as unknown) as Selection;
        };

        const mockSelection = {
            focusNode: 'node',
            isCollapsed: false,
            rangeCount: 1,
        };

        test.each([
            null,
            { ...mockSelection, isCollapsed: true },
            { ...mockSelection, rangeCount: 0 },
            { ...mockSelection, focusNode: null },
        ])('should return null if range is null', selection => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => (selection as unknown) as Selection);

            expect(getSelection()).toBe(null);
        });

        test('should return null if no text layer', () => {
            rootElement.classList.remove('textLayer');

            expect(getSelection()).toBe(null);

            // reset
            rootElement.classList.add('textLayer');
        });

        test.each`
            startClass   | endClass     | result
            ${'.range0'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range2'} | ${expect.objectContaining({ location: 2, hasError: true })}
            ${'.range1'} | ${'.range1'} | ${expect.objectContaining({ location: 1, hasError: false })}
        `('should return $result', ({ startClass, endClass, result }) => {
            jest.spyOn(window, 'getSelection').mockReturnValueOnce(generateSelection(startClass, endClass));

            expect(getSelection()).toEqual(result);
        });
    });
});
