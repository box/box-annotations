import React from 'react';
import classNames from 'classnames';
import HighlightAnnotation from './HighlightAnnotation';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight, Rect } from '../@types';
import { checkValue } from '../utils/util';

import './HighlightList.scss';

export type Props = {
    activeId: string | null;
    annotations: AnnotationHighlight[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function isValidHighlight({ target }: AnnotationHighlight): boolean {
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
    { target: targetA }: AnnotationHighlight,
    { target: targetB }: AnnotationHighlight,
): number {
    const { shapes: shapesA } = targetA;
    const { shapes: shapesB } = targetB;

    // Render the smallest highlights last to ensure they are always clickable
    return getHighlightArea(shapesA) > getHighlightArea(shapesB) ? -1 : 1;
}

export function HighlightList({ activeId, annotations, className, onSelect }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<SVGSVGElement>();

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootElRef, (): void => {
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <svg
            ref={rootElRef}
            className={classNames(className, 'ba-HighlightList', { 'is-listening': isListening })}
            data-resin-component="highlightList"
        >
            <defs>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="0" floodColor="rgba(0, 0, 0, 1)" floodOpacity="0.2" stdDeviation="2" />
                </filter>
            </defs>
            {annotations
                .filter(isValidHighlight)
                .sort(sortHighlight)
                .map(({ id, target }) => (
                    <HighlightAnnotation
                        key={id}
                        annotationId={id}
                        isActive={activeId === id}
                        onSelect={onSelect}
                        rects={target.shapes}
                    />
                ))}
        </svg>
    );
}

export default React.memo(HighlightList);
