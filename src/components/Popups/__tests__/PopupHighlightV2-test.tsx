import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as Popper from '../Popper';
import PopupHighlightV2, { Props } from '../PopupHighlightV2';

describe('PopupHighlightV2', () => {
    const renderPopup = (props: Partial<Props> = {}): ReturnType<typeof render> =>
        render(
            <PopupHighlightV2
                onCancel={jest.fn()}
                onSubmit={jest.fn()}
                shape={{
                    height: 10,
                    width: 100,
                    x: 200,
                    y: 200,
                }}
                {...props}
            />,
        );

    describe('event handlers', () => {
        test('should handle outside mousedown events', () => {
            const onCancel = jest.fn();
            renderPopup({ onCancel });

            fireEvent.mouseDown(document.body);

            expect(onCancel).toHaveBeenCalled();
        });

        test('should not cancel on mousedown inside the toolbar around the button', () => {
            const onCancel = jest.fn();
            renderPopup({ onCancel });

            fireEvent.mouseDown(screen.getByRole('toolbar'));

            expect(onCancel).not.toHaveBeenCalled();
        });

        test('should handle outside keydown events', () => {
            const onSubmit = jest.fn();
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            renderPopup({ onSubmit });

            jest.spyOn(event, 'preventDefault');
            jest.spyOn(event, 'stopPropagation');

            document.dispatchEvent(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalled();
        });

        test('should leave Enter on the button to the button so it submits once', () => {
            const onSubmit = jest.fn();
            renderPopup({ onSubmit });

            fireEvent.keyDown(screen.getByTestId('ba-PopupHighlight-button'), { key: 'Enter' });

            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('mouse events', () => {
        test('should call onSubmit when the button is clicked', () => {
            const onSubmit = jest.fn();
            renderPopup({ onSubmit });

            fireEvent.click(screen.getByTestId('ba-PopupHighlight-button'));

            expect(onSubmit).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the promoter as a toolbar button inside the dialog', () => {
            renderPopup();
            const button = screen.getByRole('button', { name: 'Highlight and Comment' });

            expect(button).toHaveAttribute('aria-haspopup', 'dialog');
            expect(button).toHaveAttribute('data-testid', 'ba-PopupHighlight-button');
            expect(button.querySelector('svg')).toBeInTheDocument();
            expect(screen.getByRole('dialog')).toContainElement(screen.getByRole('toolbar'));
        });

        test('should name the dialog for screen readers', () => {
            renderPopup();

            expect(screen.getByRole('dialog', { name: 'Highlight and Comment' })).toBeInTheDocument();
        });

        test('should position the popup against the selection rect', () => {
            const createPopper = jest.spyOn(Popper, 'default');
            renderPopup();

            const [reference] = createPopper.mock.calls[0];
            const rect = reference.getBoundingClientRect();

            expect(rect.height).toEqual(10);
            expect(rect.width).toEqual(100);
            expect(rect.left).toEqual(200);
            expect(rect.top).toEqual(200);
        });
    });
});
