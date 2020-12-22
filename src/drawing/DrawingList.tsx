import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import DrawingTarget from './DrawingTarget';
import useIsListening from '../common/useIsListening';
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
    const [rootEl, setRootEl] = React.useState<DrawingSVGRef | null>(null);
    const isListening = useIsListening();

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
