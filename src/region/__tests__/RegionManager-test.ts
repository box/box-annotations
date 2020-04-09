import ReactDOM from 'react-dom';
import { createIntl } from 'react-intl';
import { createStore } from '../../store';
import { scale } from '../__mocks__/data';
import { Options } from '../../common/BaseManager';
import RegionManager from '../RegionManager';

jest.mock('react-dom', () => ({
    render: jest.fn(),
    unmountComponentAtNode: jest.fn(),
}));

describe('RegionManager', () => {
    const intl = createIntl({ locale: 'en' });
    const pageEl = document.createElement('div');
    const getWrapper = (options: Options): RegionManager => new RegionManager(options);
    let wrapper: RegionManager;

    beforeEach(() => {
        pageEl.innerHTML = `<div class="reference" />`;

        wrapper = getWrapper({
            page: 1,
            pageEl,
            referenceEl: pageEl.querySelector('.reference') as HTMLElement,
        });
    });

    describe('constructor', () => {
        test('should set all necessary properties', () => {
            expect(wrapper.page).toEqual(1);
            expect(wrapper.pageEl).toEqual(pageEl);
            expect(wrapper.rootEl).toEqual(pageEl.querySelector('[data-testid="ba-Layer--region"]'));
        });
    });

    describe('destroy()', () => {
        test('should unmount the React node and remove the root element', () => {
            wrapper.destroy();

            expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(wrapper.rootEl);
        });
    });

    describe('exists()', () => {
        test('should return a boolean based on its presence in the page element', () => {
            expect(wrapper.exists(pageEl)).toBe(true);
            expect(wrapper.exists(document.createElement('div'))).toBe(false);
        });
    });

    describe('render()', () => {
        test('should format the props and pass them to the underlying components', () => {
            wrapper.render({ intl, scale, store: createStore() });

            expect(ReactDOM.render).toHaveBeenCalled();
        });
    });
});
