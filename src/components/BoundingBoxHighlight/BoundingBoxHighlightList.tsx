import * as React from 'react';
import BoundingBoxHighlightRect from './BoundingBoxHighlightRect';
import { BoundingBox } from './types';
import './BoundingBoxHighlightList.scss';

type Props = {
    /**
     * All bounding box highlights in the document.
     */
    allBoundingBoxes: BoundingBox[];
    /**
     * Bounding boxes on the current page.
     */
    boundingBoxes: BoundingBox[];
    /**
     * Callback invoked to navigate to the previous or next bounding box highlight.
     */
    onNavigate?: (id: string) => void;
    /**
     * Callback invoked when the user clicks on a bounding box highlight.
     */
    onSelect?: (id: string) => void;
    /**
     * The ID of the selected bounding box highlight.
     */
    selectedId: string | null;
};

const BoundingBoxHighlightList = ({
    allBoundingBoxes,
    boundingBoxes,
    onNavigate,
    onSelect,
    selectedId,
}: Props): React.ReactElement | null => {
    const total = allBoundingBoxes.length;

    if (total === 0) {
        return null;
    }

    const selectedIndex = allBoundingBoxes.findIndex(h => h.id === selectedId);
    const prevId = selectedIndex > 0 ? allBoundingBoxes[selectedIndex - 1].id : undefined;
    const nextId = selectedIndex < total - 1 ? allBoundingBoxes[selectedIndex + 1].id : undefined;

    return (
        <div className="ba-BoundingBoxHighlightList" data-testid="ba-BoundingBoxHighlightList">
            {boundingBoxes.map(bbox => {
                return (
                    <BoundingBoxHighlightRect
                        key={bbox.id}
                        boundingBox={bbox}
                        currentIndex={selectedIndex}
                        isSelected={selectedId === bbox.id}
                        nextId={nextId}
                        onNavigate={onNavigate}
                        onSelect={onSelect}
                        prevId={prevId}
                        total={total}
                    />
                );
            })}
        </div>
    );
};

export default React.memo(BoundingBoxHighlightList);
