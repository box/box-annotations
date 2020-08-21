import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import HighlightCanvas, { CanvasShape } from './HighlightCanvas';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight, Rect, TargetHighlight } from '../@types';
import { checkValue } from '../utils/util';
import './HighlightList.scss';
import HighlightRect from './HighlightRect';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationHighlight[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function filterHighlight({ target }: { target: TargetHighlight }): boolean {
    const { shapes = [] } = target;

    return shapes.every(
        ({ height, width, x, y }: Rect) => checkValue(height) && checkValue(width) && checkValue(x) && checkValue(y),
    );
}

export function getHighlightArea(shapes: Rect[]): number {
    return shapes.reduce((area, { height, width }) => area + height * width, 0);
}

export function sortHighlight(
    { target: targetA }: { target: TargetHighlight },
    { target: targetB }: { target: TargetHighlight },
): number {
    const { shapes: shapesA } = targetA;
    const { shapes: shapesB } = targetB;

    // Render the smallest highlights last to ensure they are always clickable
    return getHighlightArea(shapesA) > getHighlightArea(shapesB) ? -1 : 1;
}

export function getHighlightShapesFromAnnotations(
    annotations: AnnotationHighlight[],
    activeId: string | null,
): CanvasShape[] {
    return annotations.reduce<CanvasShape[]>((currentShapes, annotation) => {
        const {
            id,
            target: { shapes },
        } = annotation;

        return currentShapes.concat(shapes.map(shape => ({ ...shape, annotationId: id, isActive: activeId === id })));
    }, []);
}

export function HighlightList({ activeId = null, annotations, className, onSelect = noop }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const svgElRef = React.createRef<SVGSVGElement>();
    const sortedAnnotations = annotations.filter(filterHighlight).sort(sortHighlight);
    const canvasShapes = getHighlightShapesFromAnnotations(sortedAnnotations, activeId);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', svgElRef, (): void => {
        setIsListening(false);
    });
    useOutsideEvent('mouseup', svgElRef, (): void => setIsListening(true));

    return (
        <div
            className={classNames('ba-HighlightList', className, { 'is-listening': isListening })}
            data-resin-component="highlightList"
        >
            <HighlightCanvas shapes={canvasShapes} />
            {canvasShapes.map(canvasShape => {
                const { height, width, x, y } = canvasShape;
                return (
                    <HighlightRect key={`${x}-${y}-${height}-${width}`} canvasShape={canvasShape} onSelect={onSelect} />
                );
            })}
        </div>
    );
}

export default React.memo(HighlightList);
