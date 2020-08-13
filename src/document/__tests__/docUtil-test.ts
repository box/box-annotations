import { findClosestElWithClass, getPageInfo, getRange, getSelectionItem } from '../docUtil';

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

        it('should return page element and page number that the specified element is on', () => {
            const fooEl = rootElement.querySelector('.foo');
            const pageEl = rootElement.querySelector('.page');
            const result = getPageInfo(fooEl);
            expect(result.pageEl).toEqual(pageEl);
            expect(result.page).toEqual(2);
        });

        it('should return no page element and -1 page number if no page is found', () => {
            const barEl = rootElement.querySelector('.bar');
            const result = getPageInfo(barEl);
            expect(result.pageEl).toBeNull();
            expect(result.page).toEqual(-1);
        });
    });

    describe('getRange()', () => {
        test.each`
            selection                        | result
            ${null}                          | ${null}
            ${{ isCollapsed: true }}         | ${null}
            ${{ getRangeAt: () => 'range' }} | ${'range'}
        `('should return range as $result', ({ selection, result }) => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => selection);

            expect(getRange()).toBe(result);
        });
    });

    describe('getSelectionItem()', () => {
        test('should return null if range is null', () => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => null);
            expect(getSelectionItem()).toBe(null);
        });
    });
});
