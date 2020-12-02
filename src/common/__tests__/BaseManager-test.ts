import BaseManager, { Options, Props } from '../BaseManager';

class TestBaseManager extends BaseManager {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    decorate(): void {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(props: Props): void {} // eslint-disable-line @typescript-eslint/no-empty-function
}

describe('BaseManager', () => {
    const rootEl = document.createElement('div');
    const getOptions = (options: Partial<Options> = {}): Options => ({
        referenceEl: rootEl.querySelector('.reference') as HTMLElement,
        ...options,
    });
    const getWrapper = (options?: Partial<Options>): TestBaseManager => new TestBaseManager(getOptions(options));

    beforeEach(() => {
        rootEl.classList.add('root');
        rootEl.innerHTML = '<div class="reference" />'; // referenceEl
    });

    describe('constructor()', () => {
        test('should add rootLayerEl', () => {
            const wrapper = getWrapper();
            expect(wrapper.reactEl.classList.contains('ba-Layer')).toBe(true);
            expect(wrapper.reactEl.getAttribute('data-resin-feature')).toBe('annotations');
        });

        test('should add rootLayerEl with custom resin tags', () => {
            const resinTags = {
                foo: 'bar',
            };
            const wrapper = getWrapper({ resinTags });
            expect(wrapper.reactEl.classList.contains('ba-Layer')).toBe(true);
            expect(wrapper.reactEl.getAttribute('data-resin-feature')).toBe('annotations');
            expect(wrapper.reactEl.getAttribute('data-resin-foo')).toBe('bar');
        });
    });
});
