import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BoundingBoxHighlightNav from '../BoundingBoxHighlightNav';

describe('BoundingBoxHighlightNav', () => {
    const defaults = {
        currentIndex: 1,
        total: 5,
        onPrev: jest.fn(),
        onNext: jest.fn(),
    };

    const renderNav = (props = {}): ReturnType<typeof render> =>
        render(<BoundingBoxHighlightNav {...defaults} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('render()', () => {
        test('should render the nav container with correct data-testid', () => {
            renderNav();

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav')).toBeInTheDocument();
        });

        test('should render prev and next buttons', () => {
            renderNav();

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).toBeInTheDocument();
        });

        test('should display the counter with current position and total', () => {
            renderNav({ currentIndex: 2, total: 5 });

            expect(screen.getByText('3 / 5')).toBeInTheDocument();
        });

        test('should display 1-based index in the counter', () => {
            renderNav({ currentIndex: 0, total: 3 });

            expect(screen.getByText('1 / 3')).toBeInTheDocument();
        });
    });

    describe('button states', () => {
        test('should disable prev button when currentIndex is 0', () => {
            renderNav({ currentIndex: 0, total: 5 });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).toBeDisabled();
        });

        test('should enable prev button when currentIndex is greater than 0', () => {
            renderNav({ currentIndex: 1, total: 5 });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).not.toBeDisabled();
        });

        test('should disable next button when currentIndex is at last item', () => {
            renderNav({ currentIndex: 4, total: 5 });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).toBeDisabled();
        });

        test('should enable next button when currentIndex is not at last item', () => {
            renderNav({ currentIndex: 2, total: 5 });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).not.toBeDisabled();
        });

        test('should disable both buttons when total is 1', () => {
            renderNav({ currentIndex: 0, total: 1 });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).toBeDisabled();
            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).toBeDisabled();
        });
    });

    describe('callbacks', () => {
        test('should call onPrev when prev button is clicked', () => {
            const onPrev = jest.fn();
            renderNav({ currentIndex: 1, onPrev });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));

            expect(onPrev).toHaveBeenCalledTimes(1);
        });

        test('should call onNext when next button is clicked', () => {
            const onNext = jest.fn();
            renderNav({ currentIndex: 1, onNext });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));

            expect(onNext).toHaveBeenCalledTimes(1);
        });

        test('should not call onPrev when prev button is disabled and clicked', () => {
            const onPrev = jest.fn();
            renderNav({ currentIndex: 0, onPrev });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));

            expect(onPrev).not.toHaveBeenCalled();
        });

        test('should not call onNext when next button is disabled and clicked', () => {
            const onNext = jest.fn();
            renderNav({ currentIndex: 4, total: 5, onNext });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));

            expect(onNext).not.toHaveBeenCalled();
        });
    });

    describe('keyboard navigation', () => {
        test('should call onPrev when ArrowLeft is pressed', () => {
            const onPrev = jest.fn();
            renderNav({ currentIndex: 1, onPrev });

            fireEvent.keyDown(document, { key: 'ArrowLeft' });

            expect(onPrev).toHaveBeenCalledTimes(1);
        });

        test('should call onNext when ArrowRight is pressed', () => {
            const onNext = jest.fn();
            renderNav({ currentIndex: 1, onNext });

            fireEvent.keyDown(document, { key: 'ArrowRight' });

            expect(onNext).toHaveBeenCalledTimes(1);
        });

        test('should not call onPrev when ArrowLeft is pressed and at first item', () => {
            const onPrev = jest.fn();
            renderNav({ currentIndex: 0, onPrev });

            fireEvent.keyDown(document, { key: 'ArrowLeft' });

            expect(onPrev).not.toHaveBeenCalled();
        });

        test('should not call onNext when ArrowRight is pressed and at last item', () => {
            const onNext = jest.fn();
            renderNav({ currentIndex: 4, total: 5, onNext });

            fireEvent.keyDown(document, { key: 'ArrowRight' });

            expect(onNext).not.toHaveBeenCalled();
        });

        test('should stop propagation for ArrowLeft even when prev is disabled', () => {
            renderNav({ currentIndex: 0 });
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
            jest.spyOn(event, 'stopPropagation');

            document.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });

        test('should stop propagation for ArrowRight even when next is disabled', () => {
            renderNav({ currentIndex: 4, total: 5 });
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
            jest.spyOn(event, 'stopPropagation');

            document.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });

        test('should not stop propagation for non-arrow keys', () => {
            renderNav({ currentIndex: 1 });
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            jest.spyOn(event, 'stopPropagation');

            document.dispatchEvent(event);

            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        test('should not call callbacks for non-arrow keys', () => {
            const onPrev = jest.fn();
            const onNext = jest.fn();
            renderNav({ currentIndex: 1, onPrev, onNext });

            fireEvent.keyDown(document, { key: 'Enter' });

            expect(onPrev).not.toHaveBeenCalled();
            expect(onNext).not.toHaveBeenCalled();
        });

        test('should remove keydown listener on unmount', () => {
            const onPrev = jest.fn();
            const { unmount } = renderNav({ currentIndex: 1, onPrev });

            unmount();
            fireEvent.keyDown(document, { key: 'ArrowLeft' });

            expect(onPrev).not.toHaveBeenCalled();
        });
    });

    describe('accessibility', () => {
        test('should have aria-label on prev button', () => {
            renderNav();

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).toHaveAttribute(
                'aria-label',
                'View previous reference',
            );
        });

        test('should have aria-label on next button', () => {
            renderNav();

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).toHaveAttribute(
                'aria-label',
                'View next reference',
            );
        });
    });
});
