import React from 'react';
import classNames from 'classnames';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightCanvas from './HighlightCanvas';
import HighlightSvg from './HighlightSvg';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationHighlight } from '../@types';
import { isValidHighlight, sortHighlight } from './highlightUtil';
import './HighlightList.scss';

export type Props = {
    activeId?: string | null;
    annotations: Pick<AnnotationHighlight, 'id' | 'target'>[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function HighlightList({ activeId = null, annotations, className, onSelect }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<SVGSVGElement>();
    const sortedAnnotations = annotations.filter(isValidHighlight).sort(sortHighlight);

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('mousedown', rootElRef, (): void => {
        setIsListening(false);
    });
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <>
            <HighlightCanvas activeId={activeId} annotations={sortedAnnotations} />
            <HighlightSvg
                ref={rootElRef}
                className={classNames(className, 'ba-HighlightList', { 'is-listening': isListening })}
                data-resin-component="highlightList"
            >
                {sortedAnnotations.map(({ id, target }) => (
                    <HighlightAnnotation key={id} annotationId={id} onSelect={onSelect} rects={target.shapes} />
                ))}
            </HighlightSvg>
        </>
    );
}

export default React.memo(HighlightList);
