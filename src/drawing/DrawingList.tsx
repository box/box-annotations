import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import DrawingTarget from './DrawingTarget';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationDrawing } from '../@types';
import { checkValue } from '../utils/util';
import { getShape } from './drawingUtil';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationDrawing[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function filterDrawing({ target: { path_groups: pathGroups } }: AnnotationDrawing): boolean {
    return pathGroups.every(({ paths }) =>
        paths.every(({ points }) => points.every(({ x, y }) => checkValue(x) && checkValue(y))),
    );
}

export function sortDrawing({ target: targetA }: AnnotationDrawing, { target: targetB }: AnnotationDrawing): number {
    const { height: heightA, width: widthA } = getShape(targetA.path_groups);
    const { height: heightB, width: widthB } = getShape(targetB.path_groups);

    // If B is smaller, the result is negative.
    // So, A is sorted to an index lower than B, which means A will be rendered first at bottom
    return heightB * widthB - heightA * widthA;
}

export function DrawingList({ activeId = null, annotations, className, onSelect = noop }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const [rootEl, setRootEl] = React.useState<DrawingSVGRef | null>(null);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootEl, (): void => {
        onSelect(null);
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootEl, (): void => setIsListening(true));

    return (
        <DrawingSVG
            ref={setRootEl}
            className={classNames(className, { 'is-listening': isListening })}
            data-resin-component="drawingList"
        >
            {annotations
                .filter(filterDrawing)
                .sort(sortDrawing)
                .map(({ id, target }) => (
                    <DrawingTarget
                        key={id}
                        annotationId={id}
                        isActive={activeId === id}
                        onSelect={onSelect}
                        rootEl={rootEl}
                        target={target}
                    />
                ))}
        </DrawingSVG>
    );
}

export default React.memo(DrawingList);
