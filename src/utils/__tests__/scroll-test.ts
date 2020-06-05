import { scrollToLocation } from '../scroll';

describe('scrollToLocation', () => {
    const container = document.createElement('div');
    const getReference = (offsetTop = 0): HTMLElement => {
        const page = document.createElement('div');

        Object.defineProperty(page, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(page, 'clientWidth', { configurable: true, value: 100 });
        Object.defineProperty(page, 'offsetLeft', { configurable: true, value: 0 });
        Object.defineProperty(page, 'offsetTop', { configurable: true, value: offsetTop });

        return page;
    };

    beforeEach(() => {
        jest.spyOn(container, 'scrollHeight', 'get').mockReturnValue(2000);
        jest.spyOn(container, 'scrollWidth', 'get').mockReturnValue(2000);
        jest.spyOn(container, 'scrollLeft', 'set');
        jest.spyOn(container, 'scrollTop', 'set');

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        container.scrollTo = jest.fn((options?: ScrollToOptions) => {
            const { left, top } = options || {};

            container.scrollLeft = left || 0;
            container.scrollTop = top || 0;
        });
    });

    test.each`
        parentTop | scrollTop
        ${-200}   | ${0}
        ${0}      | ${0}
        ${200}    | ${200}
        ${2000}   | ${2000}
        ${3000}   | ${2000}
    `('should scroll to $scrollTop with a reference parentTop of $parentTop', ({ parentTop, scrollTop }) => {
        const reference = getReference(parentTop);

        scrollToLocation(container, reference);

        expect(container.scrollTop).toEqual(scrollTop);
    });

    test.each`
        parentTop | scrollLeft | scrollTop
        ${-200}   | ${50}      | ${0}
        ${0}      | ${50}      | ${50}
        ${200}    | ${50}      | ${250}
        ${2000}   | ${50}      | ${2000}
        ${3000}   | ${50}      | ${2000}
    `(
        'should scroll to $scrollLeft/$scrollTop with a reference parentTop of $parentTop with offsets',
        ({ parentTop, scrollLeft, scrollTop }) => {
            const reference = getReference(parentTop);

            scrollToLocation(container, reference, { offsets: { x: 50, y: 50 } });

            expect(container.scrollLeft).toEqual(scrollLeft);
            expect(container.scrollTop).toEqual(scrollTop);
        },
    );
});
