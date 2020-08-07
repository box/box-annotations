import React from 'react';
import classNames from 'classnames';
import HighlightAnnotation from './HighlightAnnotation';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight } from '../@types';

import './HighlightList.scss';

export type Props = {
    annotations: AnnotationHighlight[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function HighlightList({ annotations, className, onSelect }: Props): JSX.Element {
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
            {annotations.map(({ id, target }) => (
                <HighlightAnnotation key={id} annotationId={id} onSelect={onSelect} rects={target.shapes} />
            ))}
        </svg>
    );
}

export default React.memo(HighlightList);
