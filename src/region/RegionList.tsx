import React from 'react';
import * as Redux from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import RegionAnnotation from './RegionAnnotation';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationRegion } from '../@types';
import { getRotation } from '../store/options';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationRegion[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function checkValue(value: number): boolean {
    return value >= 0 && value <= 100; // Values cannot be negative or larger than 100%
}

export function filterRegion({ target }: AnnotationRegion): boolean {
    const { shape } = target;
    const { height, width, x, y } = shape;

    return checkValue(height) && checkValue(width) && checkValue(x) && checkValue(y);
}

export function sortRegion({ target: targetA }: AnnotationRegion, { target: targetB }: AnnotationRegion): number {
    const { shape: shapeA } = targetA;
    const { shape: shapeB } = targetB;

    // Render the smallest annotations last to ensure they are always clickable
    return shapeA.height * shapeA.width > shapeB.height * shapeB.width ? -1 : 1;
}

export function RegionList({ activeId, annotations, className, onSelect = noop }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<HTMLDivElement>();
    const rotation = Redux.useSelector(getRotation);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootElRef, (): void => {
        onSelect(null);
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <div
            ref={rootElRef}
            className={classNames(className, { 'is-listening': isListening })}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {annotations
                .filter(filterRegion)
                .sort(sortRegion)
                .map(({ id, target }) => (
                    <RegionAnnotation
                        key={id}
                        annotationId={id}
                        isActive={activeId === id}
                        onSelect={onSelect}
                        shape={target.shape}
                    />
                ))}
        </div>
    );
}

export default React.memo(RegionList);
