import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PopupDrawingToolbarV2, { Props } from '../PopupDrawingToolbarV2';

describe('PopupDrawingToolbarV2', () => {
    const getButton = (button: string): HTMLElement => screen.getByTestId(`ba-PopupDrawingToolbar-${button}`);
    const getDOMRect = (x = 0, y = 0, height = 1000, width = 1000): DOMRect => ({
        bottom: y + height,
        top: y,
        left: x,
        right: x + width,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getDefaults = (): Props => ({
        canComment: true,
        canRedo: false,
        canUndo: false,
        onDelete: jest.fn(),
        onRedo: jest.fn(),
        onReply: jest.fn(),
        onUndo: jest.fn(),
        reference: { getBoundingClientRect: () => getDOMRect() },
    });
    const renderToolbar = (props?: Partial<Props>): ReturnType<typeof render> =>
        render(<PopupDrawingToolbarV2 {...getDefaults()} {...props} />);

    describe('render', () => {
        test('should render a labeled toolbar inside the popup', () => {
            const { container } = renderToolbar({ className: 'foo' });
            const popup = container.querySelector('.ba-Popup');

            expect(popup).toHaveClass('foo', 'ba-PopupDrawingToolbarBlueprint');
            expect(popup).toHaveAttribute('data-resin-component', 'popupDrawingToolbar');
            expect(screen.getByRole('toolbar', { name: 'Drawing actions' })).toBeInTheDocument();
            expect(popup).toContainElement(screen.getByRole('toolbar'));
        });

        test.each`
            label       | buttonId
            ${'Undo'}   | ${'undo'}
            ${'Redo'}   | ${'redo'}
            ${'Delete'} | ${'delete'}
        `('should render the $label icon button with an aria-label instead of a title', ({ label, buttonId }) => {
            renderToolbar();
            const button = getButton(buttonId);

            expect(button).toBe(screen.getByRole('button', { name: label }));
            expect(button).not.toHaveAttribute('title');
            expect(button.querySelector('svg')).toBeInTheDocument();
        });

        test('should separate the icon buttons from the Add Comment text button', () => {
            renderToolbar();
            const toolbar = screen.getByRole('toolbar');
            const separator = toolbar.querySelector('[role="separator"]');

            expect(separator?.previousElementSibling).toBe(getButton('delete'));
            expect(separator?.nextElementSibling).toBe(getButton('comment'));
            expect(getButton('comment')).toHaveTextContent('Add Comment');
        });

        test.each`
            canProp         | buttonId
            ${'canComment'} | ${'comment'}
            ${'canRedo'}    | ${'redo'}
            ${'canUndo'}    | ${'undo'}
        `('should toggle the disabled state of $buttonId with $canProp', ({ canProp, buttonId }) => {
            const { rerender } = renderToolbar({ [canProp]: false });

            expect(getButton(buttonId)).toBeDisabled();

            rerender(<PopupDrawingToolbarV2 {...getDefaults()} {...{ [canProp]: true }} />);

            expect(getButton(buttonId)).toBeEnabled();
        });

        test('should never disable delete', () => {
            renderToolbar({ canComment: false, canRedo: false, canUndo: false });

            expect(getButton('delete')).toBeEnabled();
        });
    });

    describe('tooltips', () => {
        test('should show the label in a tooltip inside the tooltip container', () => {
            const tooltipContainer = document.createElement('div');
            document.body.appendChild(tooltipContainer);

            renderToolbar({ canUndo: true, tooltipContainer });
            act(() => getButton('undo').focus());

            expect(tooltipContainer).toHaveTextContent('Undo');

            document.body.removeChild(tooltipContainer);
        });
    });

    describe('keyboard', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const pressKey = (button: string, key: string): void => {
            fireEvent.keyDown(getButton(button), { key });
            act(() => {
                jest.runOnlyPendingTimers();
            });
        };

        test('should move focus across enabled buttons with the arrow keys', () => {
            renderToolbar({ canUndo: true });
            act(() => getButton('undo').focus());

            // Redo is disabled, so roving focus skips it
            pressKey('undo', 'ArrowRight');
            expect(getButton('delete')).toHaveFocus();

            pressKey('delete', 'ArrowRight');
            expect(getButton('comment')).toHaveFocus();

            pressKey('comment', 'Home');
            expect(getButton('undo')).toHaveFocus();
        });
    });

    describe('callbacks', () => {
        test.each`
            callback      | buttonId
            ${'onUndo'}   | ${'undo'}
            ${'onRedo'}   | ${'redo'}
            ${'onDelete'} | ${'delete'}
            ${'onReply'}  | ${'comment'}
        `('should call $callback when $buttonId is clicked', ({ callback, buttonId }) => {
            const mockFn = jest.fn();
            renderToolbar({ canComment: true, canRedo: true, canUndo: true, [callback]: mockFn });

            fireEvent.click(getButton(buttonId));

            expect(mockFn).toHaveBeenCalled();
        });
    });
});
