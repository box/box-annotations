import { findClosestElWithClass, getPageNumber } from '../docUtil';

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
});
