import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { CanvasShape } from './HighlightCanvas';
import './HighlightRect.scss';

type Props = {
    canvasShape: CanvasShape;
    onSelect?: (annotationId: string | null) => void;
};

const HighlightRect = ({ canvasShape, onSelect = noop }: Props, ref: React.Ref<HTMLButtonElement>): JSX.Element => {
    const { annotationId, height, isActive, width, x, y } = canvasShape;

    const handleFocus = (): void => {
        if (annotationId) {
            onSelect(annotationId);
        }
    };

    return (
        <button
            ref={ref}
            className={classNames('ba-HighlightRect', { 'is-active': isActive })}
            onFocus={handleFocus}
            style={{ top: `${y}%`, left: `${x}%`, height: `${height}%`, width: `${width}%` }}
            tabIndex={-1}
            type="button"
        />
    );
};

export default React.forwardRef(HighlightRect);
