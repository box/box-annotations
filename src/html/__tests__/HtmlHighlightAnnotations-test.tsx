import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import HighlightAnnotations from '../../highlight/HighlightAnnotations';
import HtmlHighlightAnnotations from '../HtmlHighlightAnnotations';
import { AnnotationHighlight } from '../../@types';
import { createStore } from '../../store';

jest.mock('../../highlight/HighlightAnnotations', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

describe('html/HtmlHighlightAnnotations', () => {
    const annotations = [
        { id: 'anno_1', target: { shapes: [{ height: 10, width: 10, x: 0, y: 0 }] } },
        { id: 'anno_2', target: { shapes: [{ height: 20, width: 20, x: 50, y: 50 }] } },
    ] as AnnotationHighlight[];
    const setActiveAnnotationId = jest.fn();
    const getProps = (props = {}): React.ComponentProps<typeof HtmlHighlightAnnotations> =>
        ({
            activeAnnotationId: null,
            annotations,
            isCreating: false,
            isPending: false,
            isPromoting: false,
            isSelecting: false,
            location: 1,
            rotation: 0,
            selection: null,
            setActiveAnnotationId,
            ...props,
        }) as unknown as React.ComponentProps<typeof HtmlHighlightAnnotations>;
    const renderAnnotations = (props = {}): ReturnType<typeof render> =>
        render(
            <Provider store={createStore()}>
                <HtmlHighlightAnnotations {...getProps(props)} />
            </Provider>,
        );
    const getTarget = (container: HTMLElement, id: string): Element =>
        container.querySelector(`[data-ba-annotation-id="${id}"]`) as Element;

    test('should paint saved highlights with SVG rects and no canvas', () => {
        const { container } = renderAnnotations();

        expect(container.querySelector('canvas')).toBeNull();
        expect(container.querySelectorAll('.ba-HighlightTarget-rect')).toHaveLength(2);
    });

    test('should leave saved highlights out of the shared component, which still handles creation', () => {
        renderAnnotations({ isCreating: true });

        expect(HighlightAnnotations).toHaveBeenCalledWith(
            expect.objectContaining({ annotations: [], isCreating: true, setActiveAnnotationId }),
            expect.anything(),
        );
    });

    test('should mark the active highlight', () => {
        const { container } = renderAnnotations({ activeAnnotationId: 'anno_2' });

        expect(getTarget(container, 'anno_2')).toHaveClass('is-active');
        expect(getTarget(container, 'anno_1')).not.toHaveClass('is-active');
    });

    test('should mark the hovered highlight until the pointer leaves', () => {
        const { container } = renderAnnotations();

        fireEvent.mouseEnter(getTarget(container, 'anno_1'));
        expect(getTarget(container, 'anno_1')).toHaveClass('is-hover');
        expect(getTarget(container, 'anno_2')).not.toHaveClass('is-hover');

        fireEvent.mouseLeave(getTarget(container, 'anno_1'));
        expect(getTarget(container, 'anno_1')).not.toHaveClass('is-hover');
    });

    test('should select a highlight on focus', () => {
        const { container } = renderAnnotations();

        fireEvent.focus(getTarget(container, 'anno_1'));

        expect(setActiveAnnotationId).toHaveBeenCalledWith('anno_1');
    });
});
