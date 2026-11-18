import { createRoot } from 'react-dom/client';
import { createIntl } from 'react-intl';
import DrawingAnnotationsContainer from '../../drawing/DrawingAnnotationsContainer';
import DrawingManager from '../../drawing/DrawingManager';
import HtmlDrawingManager from '../HtmlDrawingManager';
import UniformBlurContext from '../../drawing/UniformBlurContext';
import { createStore } from '../../store';

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn().mockReturnValue({
        render: jest.fn(),
        unmount: jest.fn(),
    }),
}));

describe('html/HtmlDrawingManager', () => {
    const intl = createIntl({ locale: 'en' });
    const store = createStore();
    const referenceEl = document.createElement('div');
    const popupPortalEl = document.createElement('div');
    const parentEl = document.createElement('div');

    beforeEach(() => {
        parentEl.appendChild(referenceEl);
    });

    test('should be a drawing manager', () => {
        expect(new HtmlDrawingManager({ popupPortalEl, referenceEl })).toBeInstanceOf(DrawingManager);
    });

    test('should render the drawing layer with uniform blur turned on', () => {
        const manager = new HtmlDrawingManager({ location: 1, popupPortalEl, referenceEl });

        manager.render({ intl, store });

        const element = (createRoot as jest.Mock).mock.results[0].value.render.mock.calls[0][0];
        const container = element.props.children;
        expect(element.type).toBe(UniformBlurContext.Provider);
        expect(element.props.value).toBe(true);
        expect(container.type).toBe(DrawingAnnotationsContainer);
        expect(container.props.location).toBe(1);
        expect(container.props.popupPortalEl).toBe(popupPortalEl);
        expect(container.props.referenceEl).toBe(referenceEl);
        expect(container.props.store).toBe(store);
    });
});
