import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Toolbar, Tooltip } from '@box/blueprint-web';
import PopupToolbar, { Props } from '../PopupToolbar';

describe('PopupToolbar', () => {
    const renderToolbar = (props?: Partial<Props>): ReturnType<typeof render> =>
        render(
            <PopupToolbar aria-label="Actions" {...props}>
                <Tooltip content="First tip">
                    <Toolbar.Button aria-label="First">1</Toolbar.Button>
                </Tooltip>
                <Toolbar.Button>Second</Toolbar.Button>
            </PopupToolbar>,
        );

    test('should render a labeled dark Blueprint toolbar', () => {
        renderToolbar();

        expect(screen.getByRole('toolbar', { name: 'Actions' })).toHaveAttribute('data-color-scheme', 'dark');
    });

    test('should forward its ref to the toolbar element', () => {
        const ref = React.createRef<HTMLDivElement>();

        render(
            <PopupToolbar ref={ref}>
                <Toolbar.Button>Only</Toolbar.Button>
            </PopupToolbar>,
        );

        expect(ref.current).toBe(screen.getByRole('toolbar'));
    });

    test('should portal tooltips into the tooltip container', () => {
        const tooltipContainer = document.createElement('div');
        document.body.appendChild(tooltipContainer);

        renderToolbar({ tooltipContainer });
        act(() => screen.getByRole('button', { name: 'First' }).focus());

        expect(tooltipContainer).toHaveTextContent('First tip');

        document.body.removeChild(tooltipContainer);
    });

    describe('keyboard', () => {
        const onDocumentKeydown = jest.fn();

        beforeEach(() => {
            document.addEventListener('keydown', onDocumentKeydown);
        });

        afterEach(() => {
            document.removeEventListener('keydown', onDocumentKeydown);
        });

        test.each(['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '])(
            'should keep %p from reaching document handlers',
            key => {
                renderToolbar();
                fireEvent.keyDown(screen.getByRole('button', { name: 'Second' }), { key });

                expect(onDocumentKeydown).not.toHaveBeenCalled();
            },
        );

        test.each(['Escape', 'Tab', 'a'])('should let %p reach document handlers', key => {
            renderToolbar();
            fireEvent.keyDown(screen.getByRole('button', { name: 'Second' }), { key });

            expect(onDocumentKeydown).toHaveBeenCalled();
        });
    });
});
