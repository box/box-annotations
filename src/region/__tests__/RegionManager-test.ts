import ReactDOM from 'react-dom/client';
import { createIntl } from 'react-intl';
import RegionManager from '../RegionManager';
import { createStore } from '../../store';
import { Options } from '../../common/BaseManager';

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn().mockReturnValue({
        render: jest.fn(),
        unmount: jest.fn(),
    }),
}));

describe('RegionManager', () => {
    const intl = createIntl({ locale: 'en' });
    const rootEl = document.createElement('div');
    const getOptions = (options: Partial<Options> = {}): Options => ({
        referenceEl: rootEl.querySelector('.reference') as HTMLElement,
        ...options,
    });
    const getLayer = (): HTMLElement => rootEl.querySelector('[data-testid="ba-Layer--region"]') as HTMLElement;
    const getWrapper = (options?: Partial<Options>): RegionManager => new RegionManager(getOptions(options));

    beforeEach(() => {
        rootEl.classList.add('root');
        rootEl.innerHTML = '<div class="reference" />'; // referenceEl
    });

    describe('constructor', () => {
        test('should set all necessary properties', () => {
            const wrapper = getWrapper();

            expect(wrapper.location).toEqual(1);
            expect(wrapper.reactEl).toEqual(getLayer());
        });
    });

    describe('destroy()', () => {
        test('should unmount the React node and remove the root element', () => {
            const wrapper = getWrapper();
            const root = ReactDOM.createRoot(rootEl);

            wrapper.destroy();

            expect(root.unmount).toHaveBeenCalled();
        });
    });

    describe('exists()', () => {
        test('should return a boolean based on its presence in the page element', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(rootEl)).toBe(true);
            expect(wrapper.exists(document.createElement('div'))).toBe(false);
        });
    });

    describe('render()', () => {
        test('should format the props and pass them to the underlying components', () => {
            const wrapper = getWrapper();
            const root = ReactDOM.createRoot(rootEl);

            wrapper.render({ intl, store: createStore() });

            expect(root.render).toHaveBeenCalled();
        });
    });

    describe('style', () => {
        test('should assign the style object to the root element', () => {
            const wrapper = getWrapper();

            wrapper.style({ left: '5px', top: '10px' });

            expect(getLayer().style.left).toEqual('5px');
            expect(getLayer().style.top).toEqual('10px');
        });
    });
});
