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
