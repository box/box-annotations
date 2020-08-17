import React from 'react';
import classNames from 'classnames';
import HighlightCanvas, { CanvasShapeRect } from './HighlightCanvas';
import HighlightSvg from './HighlightSvg';
import HighlightTarget from './HighlightTarget';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight, Rect, TargetHighlight } from '../@types';
import { checkValue } from '../utils/util';
import './HighlightList.scss';

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

export function getRectsFromAnnotations(annotations: AnnotationHighlight[]): CanvasShapeRect[] {
    return annotations.reduce<CanvasShapeRect[]>((rects, annotation) => {
        const {
            id,
            target: { shapes },
        } = annotation;

        shapes.forEach(rect => rects.push({ ...rect, id }));

        return rects;
    }, []);
}

export function HighlightList({ activeId = null, annotations, className, onSelect }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<SVGSVGElement>();
    const sortedAnnotations = annotations.filter(filterHighlight).sort(sortHighlight);
    const canvasShapes = getRectsFromAnnotations(sortedAnnotations);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootElRef, (): void => {
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <div className={classNames('ba-HighlightList', className)} data-resin-component="highlightList">
            <HighlightCanvas activeId={activeId} shapes={canvasShapes} />
            <HighlightSvg ref={rootElRef} className={classNames({ 'is-listening': isListening })}>
                {sortedAnnotations.map(({ id, target }) => (
                    <HighlightTarget key={id} annotationId={id} onSelect={onSelect} rects={target.shapes} />
                ))}
            </HighlightSvg>
        </div>
    );
}

export default React.memo(HighlightList);
