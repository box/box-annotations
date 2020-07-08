import { scrollToLocation } from '../scroll';

describe('scrollToLocation', () => {
    const container = document.createElement('div');
    const getDOMRect = (x: number, y: number, height: number, width: number): DOMRect => ({
        bottom: x + height,
        top: y,
        left: x,
        right: y + width,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getReference = ({ offsetLeft = 0, offsetTop = 0 }): HTMLElement => {
        const page = document.createElement('div');

        Object.defineProperty(page, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({ height: 100, left: offsetLeft, top: offsetTop, width: 100 }),
        });
        Object.defineProperty(page, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(page, 'clientWidth', { configurable: true, value: 100 });
        Object.defineProperty(page, 'offsetLeft', { configurable: true, value: offsetLeft });
        Object.defineProperty(page, 'offsetTop', { configurable: true, value: offsetTop });

        return page;
    };

    beforeEach(() => {
        jest.spyOn(container, 'clientHeight', 'get').mockReturnValue(200);
        jest.spyOn(container, 'clientWidth', 'get').mockReturnValue(200);
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

        const containerRect = getDOMRect(0, 0, 200, 200);
        container.getBoundingClientRect = jest.fn(() => containerRect);

        container.scrollLeft = 0;
        container.scrollTop = 0;
    });

    test.each`
        offsetTop | scrollTop
        ${-200}   | ${0}
        ${0}      | ${0}
        ${200}    | ${100}
        ${2000}   | ${1900}
        ${3000}   | ${2000}
    `('should scroll to $scrollTop with a reference offsetTop of $offsetTop', ({ offsetTop, scrollTop }) => {
        const reference = getReference({ offsetTop });

        scrollToLocation(container, reference);

        expect(container.scrollTop).toEqual(scrollTop);
    });

    test.each`
        offsetTop | offsetLeft | scrollLeft | scrollTop
        ${-200}   | ${-200}    | ${0}       | ${0}
        ${0}      | ${0}       | ${0}       | ${0}
        ${200}    | ${200}     | ${150}     | ${150}
        ${2000}   | ${2000}    | ${1950}    | ${1950}
        ${3000}   | ${3000}    | ${2000}    | ${2000}
    `(
        'should scroll to $scrollLeft/$scrollTop with a reference offsetTop of $offsetTop with offsets',
        ({ offsetTop, offsetLeft, scrollLeft, scrollTop }) => {
            const reference = getReference({ offsetLeft, offsetTop });

            scrollToLocation(container, reference, { offsets: { x: 50, y: 50 } });

            expect(container.scrollLeft).toEqual(scrollLeft);
            expect(container.scrollTop).toEqual(scrollTop);
        },
    );
});
