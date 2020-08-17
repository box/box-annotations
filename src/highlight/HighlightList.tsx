import React from 'react';
import classNames from 'classnames';
import HighlightCanvas from './HighlightCanvas';
import HighlightSvg from './HighlightSvg';
import HighlightTarget from './HighlightTarget';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight, Rect, TargetHighlight } from '../@types';
import { checkValue } from '../utils/util';
import './HighlightList.scss';

export type Props = {
    activeId?: string | null;
    annotations: Pick<AnnotationHighlight, 'id' | 'target'>[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function filterHighlight({ target }: { target: TargetHighlight }): boolean {
    const { shapes = [] } = target;

    return shapes.reduce((isValid: boolean, rect: Rect) => {
        const { height, width, x, y } = rect;
        return isValid && checkValue(height) && checkValue(width) && checkValue(x) && checkValue(y);
    }, true);
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

export function HighlightList({ activeId = null, annotations, className, onSelect }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<SVGSVGElement>();
    const sortedAnnotations = annotations.filter(filterHighlight).sort(sortHighlight);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootElRef, (): void => {
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <div className={classNames('ba-HighlightList', className)} data-resin-component="highlightList">
            <HighlightCanvas activeId={activeId} annotations={sortedAnnotations} />
            <HighlightSvg ref={rootElRef} className={classNames({ 'is-listening': isListening })}>
                {sortedAnnotations.map(({ id, target }) => (
                    <HighlightTarget key={id} annotationId={id} onSelect={onSelect} rects={target.shapes} />
                ))}
            </HighlightSvg>
        </div>
    );
}

export default React.memo(HighlightList);
