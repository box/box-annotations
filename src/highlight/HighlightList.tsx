import React from 'react';
import classNames from 'classnames';
import HighlightCanvas, { CanvasShape } from './HighlightCanvas';
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

export function getHighlightShapesFromAnnotations(
    annotations: AnnotationHighlight[],
    activeId: string | null,
    hoverId: string | null,
): CanvasShape[] {
    return annotations.reduce<CanvasShape[]>((currentShapes, annotation) => {
        const {
            id,
            target: { shapes },
        } = annotation;

        return currentShapes.concat(
            shapes.map(shape => ({
                ...shape,
                isActive: activeId === id,
                isHover: hoverId === id,
            })),
        );
    }, []);
}

export function HighlightList({ activeId = null, annotations, className, onSelect }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const [hoverId, setHoverId] = React.useState<string | null>(null);
    const svgElRef = React.createRef<SVGSVGElement>();
    const sortedAnnotations = annotations.filter(filterHighlight).sort(sortHighlight);
    const canvasShapes = getHighlightShapesFromAnnotations(sortedAnnotations, activeId, hoverId);

    const handleTargetHover = (annotationId: string | null): void => {
        setHoverId(annotationId);
    };

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', svgElRef, (): void => setIsListening(false));
    useOutsideEvent('mouseup', svgElRef, (): void => setIsListening(true));

    return (
        <div className={classNames('ba-HighlightList', className)} data-resin-component="highlightList">
            <HighlightCanvas shapes={canvasShapes} />
            <HighlightSvg ref={svgElRef} className={classNames({ 'is-listening': isListening })}>
                {sortedAnnotations.map(({ id, target }) => (
                    <HighlightTarget
                        key={id}
                        annotationId={id}
                        isActive={activeId === id}
                        onHover={handleTargetHover}
                        onSelect={onSelect}
                        shapes={target.shapes}
                    />
                ))}
            </HighlightSvg>
        </div>
    );
}

export default React.memo(HighlightList);
