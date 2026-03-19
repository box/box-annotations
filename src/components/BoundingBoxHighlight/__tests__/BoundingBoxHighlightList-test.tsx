import React from 'react';
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react';
import BoundingBoxHighlightList from '../BoundingBoxHighlightList';
import { BoundingBox } from '../../../store/boundingBoxHighlights/types';

describe('BoundingBoxHighlightList', () => {
    const createBoundingBox = (id: string, pageNumber = 1): BoundingBox => ({
        id,
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        pageNumber,
    });

    const allBoundingBoxes: BoundingBox[] = [
        createBoundingBox('box-1'),
        createBoundingBox('box-2'),
        createBoundingBox('box-3'),
    ];

    const defaults = {
        allBoundingBoxes,
        boundingBoxes: allBoundingBoxes,
        selectedId: 'box-2' as string | null,
    };

    const renderList = (props = {}): RenderResult =>
        render(<BoundingBoxHighlightList {...defaults} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('render()', () => {
        test('should render container with correct data-testid', () => {
            renderList();

            expect(screen.getByTestId('ba-BoundingBoxHighlightList')).toBeInTheDocument();
        });

        test('should render BoundingBoxHighlightRect for each boundingBox', () => {
            const boundingBoxes = [createBoundingBox('box-a'), createBoundingBox('box-b')];
            renderList({
                allBoundingBoxes: boundingBoxes,
                boundingBoxes,
                selectedId: 'box-a',
            });

            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-a')).toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-b')).toBeInTheDocument();
        });

        test('should pass boundingBox to each BoundingBoxHighlightRect', () => {
            renderList();

            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1')).toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-2')).toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-3')).toBeInTheDocument();
        });

        test('should pass total from allBoundingBoxes length', () => {
            renderList();

            // Selected rect shows nav with "X / total" - box-2 is selected, index 1, so "2 / 3"
            expect(screen.getByText('2 / 3')).toBeInTheDocument();
        });

        test('should pass isSelected true only for the selected boundingBox', () => {
            renderList({ selectedId: 'box-2' });

            const selectedRect = screen.getByTestId('ba-BoundingBoxHighlightRect-box-2');
            expect(selectedRect).toHaveClass('is-selected');
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1')).not.toHaveClass(
                'is-selected',
            );
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-3')).not.toHaveClass(
                'is-selected',
            );
        });

        test('should pass currentIndex based on selectedId position in allBoundingBoxes', () => {
            renderList({ selectedId: 'box-3' });

            // box-3 is at index 2, so counter shows "3 / 3"
            expect(screen.getByText('3 / 3')).toBeInTheDocument();
        });

        test('should pass onNavigate and onSelect callbacks', () => {
            const onNavigate = jest.fn();
            const onSelect = jest.fn();
            renderList({ onNavigate, onSelect });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightRect-box-1'));
            expect(onSelect).toHaveBeenCalledWith('box-1');

            // Click prev on selected box (box-2) to navigate
            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));
            expect(onNavigate).toHaveBeenCalledWith('box-1');
        });
    });

    describe('prevId and nextId', () => {
        test('should pass prevId and nextId for circular navigation when total > 1', () => {
            const onNavigate = jest.fn();
            renderList({ selectedId: 'box-2', onNavigate });

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));
            expect(onNavigate).toHaveBeenCalledWith('box-1');
            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));
            expect(onNavigate).toHaveBeenCalledWith('box-3');
        });

        test('should not render nav when total is 1', () => {
            const singleHighlight = [createBoundingBox('box-only')];
            renderList({
                allBoundingBoxes: singleHighlight,
                boundingBoxes: singleHighlight,
                selectedId: 'box-only',
            });

            // Nav is not shown when total is 1 (nothing to navigate to)
            expect(screen.queryByTestId('ba-BoundingBoxHighlightNav')).not.toBeInTheDocument();
        });

        test('should disable prev button when selectedId is at first item', () => {
            renderList({ selectedId: 'box-1' });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-prev')).toBeDisabled();
        });

        test('should disable next button when selectedId is at last item', () => {
            renderList({ selectedId: 'box-3' });

            expect(screen.getByTestId('ba-BoundingBoxHighlightNav-next')).toBeDisabled();
        });

        test('should render without nav when selectedId is not in allBoundingBoxes', () => {
            renderList({ selectedId: 'non-existent' });

            // No rect is selected, so nav is not rendered
            expect(screen.queryByTestId('ba-BoundingBoxHighlightNav')).not.toBeInTheDocument();
        });
    });

    describe('boundingBoxes subset of allBoundingBoxes', () => {
        test('should render only boundingBoxes but use allBoundingBoxes for navigation indices', () => {
            const page2Boxes = [createBoundingBox('box-2', 2), createBoundingBox('box-3', 2)];
            const onNavigate = jest.fn();
            renderList({
                boundingBoxes: page2Boxes,
                selectedId: 'box-2',
                onNavigate,
            });

            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-2')).toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightRect-box-3')).toBeInTheDocument();
            expect(screen.queryByTestId('ba-BoundingBoxHighlightRect-box-1')).not.toBeInTheDocument();

            // Counter shows position in allBoundingBoxes (box-2 is index 1, so "2 / 3")
            expect(screen.getByText('2 / 3')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-prev'));
            expect(onNavigate).toHaveBeenCalledWith('box-1');
            fireEvent.click(screen.getByTestId('ba-BoundingBoxHighlightNav-next'));
            expect(onNavigate).toHaveBeenCalledWith('box-3');
        });
    });

    describe('empty state', () => {
        test('should return null when allBoundingBoxes is empty', () => {
            const { container } = renderList({
                allBoundingBoxes: [],
                boundingBoxes: [],
            });

            expect(container.firstChild).toBeNull();
        });

        test('should render empty list when boundingBoxes is empty but allBoundingBoxes has items', () => {
            renderList({ boundingBoxes: [] });

            expect(screen.queryByTestId('ba-BoundingBoxHighlightRect-box-1')).not.toBeInTheDocument();
            expect(screen.getByTestId('ba-BoundingBoxHighlightList')).toBeInTheDocument();
        });
    });
});
