import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createIntl } from 'react-intl';
import HtmlHighlightManager from '../HtmlHighlightManager';
import { createStore } from '../../store';
import { getHighlightShapes } from '../htmlUtil';
import { target } from '../../highlight/__mocks__/data';

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn().mockReturnValue({
        render: jest.fn(),
        unmount: jest.fn(),
    }),
}));
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    flushSync: jest.fn((callback: () => void) => callback()),
}));
jest.mock('../htmlUtil', () => ({
    getHighlightShapes: jest.fn().mockReturnValue([]),
}));

describe('html/HtmlHighlightManager', () => {
    const intl = createIntl({ locale: 'en' });
    const store = createStore();
    const contentEl = document.createElement('div');
    const referenceEl = document.createElement('div');
    const popupPortalEl = document.createElement('div');
    const parentEl = document.createElement('div');
    const getManager = (): HtmlHighlightManager => new HtmlHighlightManager({ contentEl, popupPortalEl, referenceEl });
    const getRender = (): jest.Mock => (createRoot as jest.Mock).mock.results[0].value.render;
    const getRenderedProps = (call: number): Record<string, unknown> => getRender().mock.calls[call][0].props;

    beforeEach(() => {
        parentEl.appendChild(referenceEl);
    });

    test('should insert the layer after the reference element', () => {
        const manager = getManager();

        expect(referenceEl.nextSibling).toBe(manager.reactEl);
    });

    test('should resolve shapes from the content element, once per target per render', () => {
        const getShapes = getManager().createGetShapes();

        getShapes(target);
        getShapes(target);

        expect(getHighlightShapes).toHaveBeenCalledTimes(1);
        expect(getHighlightShapes).toHaveBeenCalledWith(contentEl, target, popupPortalEl);
    });

    test('should pass a new shape resolver on every render so a new layout is picked up', () => {
        const manager = getManager();

        manager.render({ intl, store });
        manager.render({ intl, store });

        expect(getRenderedProps(0).location).toBe(1);
        expect(getRenderedProps(0).popupPortalEl).toBe(popupPortalEl);
        expect(getRenderedProps(0).getShapes).not.toBe(getRenderedProps(1).getShapes);
    });

    test('should re-render with the last props and a new shape resolver when updating shapes', () => {
        const manager = getManager();

        manager.updateShapes();
        expect(getRender()).not.toHaveBeenCalled();

        manager.render({ intl, store });
        manager.updateShapes();

        expect(getRender()).toHaveBeenCalledTimes(2);
        expect(getRenderedProps(1).store).toBe(store);
        expect(getRenderedProps(1).getShapes).not.toBe(getRenderedProps(0).getShapes);
    });

    test('should commit the shapes update synchronously, so popups can be re-placed right after', () => {
        const manager = getManager();
        manager.render({ intl, store });
        getRender().mockClear();
        (flushSync as jest.Mock).mockImplementationOnce((callback: () => void) => {
            expect(getRender()).not.toHaveBeenCalled();
            callback();
            expect(getRender()).toHaveBeenCalledTimes(1);
        });

        manager.updateShapes();

        expect(flushSync).toHaveBeenCalledTimes(1);
        expect(getRender()).toHaveBeenCalledTimes(1);
    });
});
