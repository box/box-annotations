import * as React from 'react';
import classNames from 'classnames';
import BoundingBoxHighlightNav from './BoundingBoxHighlightNav';
import { BoundingBox } from '../../store/boundingBoxHighlights/types';
import './BoundingBoxHighlightRect.scss';

type Props = {
    boundingBox: BoundingBox;
    currentIndex: number;
    isSelected?: boolean;
    onNavigate?: (id: string) => void;
    onSelect?: (id: string) => void;
    total: number;
    prevId?: string;
    nextId?: string;
};

const BoundingBoxHighlightRect = ({
    boundingBox,
    currentIndex,
    isSelected,
    onNavigate,
    onSelect,
    total,
    prevId,
    nextId,
}: Props): JSX.Element => {
    const { id, x, y, width, height } = boundingBox;

    const style: React.CSSProperties = {
        display: 'block',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
    };

    const handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        onSelect?.(id);
    };

    const handlePrev = (event: React.MouseEvent): void => {
        event.stopPropagation();
        if (prevId) {
            onNavigate?.(prevId);
        }
    };

    const handleNext = (event: React.MouseEvent): void => {
        event.stopPropagation();
        if (nextId) {
            onNavigate?.(nextId);
        }
    };

    return (
        <div
            className={classNames('ba-BoundingBoxHighlightRect', { 'is-selected': isSelected })}
            data-testid={`ba-BoundingBoxHighlightRect-${id}`}
            onClick={handleClick}
            role="presentation"
            style={style}
        >
            {isSelected && total > 1 && (
                <BoundingBoxHighlightNav
                    currentIndex={currentIndex}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    total={total}
                />
            )}
        </div>
    );
};

export default BoundingBoxHighlightRect;
