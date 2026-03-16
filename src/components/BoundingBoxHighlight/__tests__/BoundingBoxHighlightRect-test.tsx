import React from 'react';
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react';
import BoundingBoxHighlightRect from '../BoundingBoxHighlightRect';
import { BoundingBox } from '../types';

describe('BoundingBoxHighlightRect', () => {
    const defaultBoundingBox: BoundingBox = {
        id: 'box-1',
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        pageNumber: 1,
    };

    const defaults = {
        boundingBox: defaultBoundingBox,
        currentIndex: 1,
        total: 5,
    };

    const renderRect = (props = {}): RenderResult =>
        render(<BoundingBoxHighlightRect {...defaults} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('render()', () => {
        test('should render the rect with correct data-testid', () => {
            renderRect();

            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1')).toBeInTheDocument();
        });

        test('should apply styles from boundingBox dimensions', () => {
            renderRect();

            const rect = screen.getByTestId('ba-BoundingBoxHighlightRect-box-1');
            expect(rect).toHaveStyle({
                display: 'block',
                left: '10%',
                top: '20%',
                width: '30%',
                height: '40%',
            });
        });

        test('should apply is-selected class when isSelected is true', () => {
            renderRect({ isSelected: true });

            const rect = screen.getByTestId('ba-BoundingBoxHighlightRect-box-1');
            expect(rect).toHaveClass('is-selected');
        });

        test('should not apply is-selected class when isSelected is false', () => {
            renderRect({ isSelected: false });

            const rect = screen.getByTestId('ba-BoundingBoxHighlightRect-box-1');
            expect(rect).not.toHaveClass('is-selected');
        });

        test('should not render BoundingBoxHighlightNav when not selected', () => {
            renderRect({ isSelected: false });

            expect(screen.queryByTestId('ba-BoundingBoxHighlightNav')).not.toBeInTheDocument();
        });

        test('should not render BoundingBoxHighlightNav when total is 0', () => {
            renderRect({ isSelected: true, total: 0 });

            expect(screen.queryByTestId('ba-BoundingBoxHighlightNav')).not.toBeInTheDocument();
        });

        test('should render BoundingBoxHighlightNav when selected and total > 0', () => {
            renderRect({ isSelected: true });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav')).toBeInTheDocument();
        });

        test('should pass currentIndex and total to BoundingBoxHighlightNav', () => {
            renderRect({
                isSelected: true,
                currentIndex: 2,
                total: 5,
            });

            expect(screen.getByText('3 / 5')).toBeInTheDocument();
        });
    });

    describe('onSelect', () => {
        test('should call onSelect with boundingBox id when rect is clicked', () => {
            const onSelect = jest.fn();
            renderRect({ onSelect });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1'));

            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenCalledWith('box-1');
        });

        test('should not throw when onSelect is not provided', () => {
            renderRect();

            expect(() => {
                fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1'));
            }).not.toThrow();
        });

        test('should stop propagation on click', () => {
            const onSelect = jest.fn();
            renderRect({ onSelect });
            const event = new MouseEvent('click', { bubbles: true });
            const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

            fireEvent(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1'), event);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('navigation', () => {
        test('should call onNavigate with prevId when prev button is clicked', () => {
            const onNavigate = jest.fn();
            renderRect({
                isSelected: true,
                prevId: 'box-0',
                nextId: 'box-2',
                onNavigate,
            });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));

            expect(onNavigate).toHaveBeenCalledTimes(1);
            expect(onNavigate).toHaveBeenCalledWith('box-0');
        });

        test('should call onNavigate with nextId when next button is clicked', () => {
            const onNavigate = jest.fn();
            renderRect({
                isSelected: true,
                prevId: 'box-0',
                nextId: 'box-2',
                onNavigate,
            });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));

            expect(onNavigate).toHaveBeenCalledTimes(1);
            expect(onNavigate).toHaveBeenCalledWith('box-2');
        });

        test('should not call onNavigate when prevId is undefined and prev button is clicked', () => {
            const onNavigate = jest.fn();
            renderRect({
                isSelected: true,
                prevId: undefined,
                nextId: 'box-2',
                onNavigate,
                currentIndex: 1,
            });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));

            expect(onNavigate).not.toHaveBeenCalled();
        });

        test('should not call onNavigate when nextId is undefined and next button is clicked', () => {
            const onNavigate = jest.fn();
            renderRect({
                isSelected: true,
                prevId: 'box-0',
                nextId: undefined,
                onNavigate,
                currentIndex: 2,
                total: 5,
            });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));

            expect(onNavigate).not.toHaveBeenCalled();
        });

        test('should stop propagation when nav buttons are clicked', () => {
            const onNavigate = jest.fn();
            renderRect({
                isSelected: true,
                prevId: 'box-0',
                nextId: 'box-2',
                onNavigate,
            });

            const prevEvent = new MouseEvent('click', { bubbles: true });
            const prevStopSpy = jest.spyOn(prevEvent, 'stopPropagation');
            fireEvent(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'), prevEvent);
            expect(prevStopSpy).toHaveBeenCalled();

            const nextEvent = new MouseEvent('click', { bubbles: true });
            const nextStopSpy = jest.spyOn(nextEvent, 'stopPropagation');
            fireEvent(screen.getByTestId('ba-BoundingBoxHighlightNav-next'), nextEvent);
            expect(nextStopSpy).toHaveBeenCalled();
        });
    });

    describe('accessibility', () => {
        test('should have role="presentation" on the rect', () => {
            renderRect();

            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1')).toHaveAttribute('role', 'presentation');
        });
    });
});
