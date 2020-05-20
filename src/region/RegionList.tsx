import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import RegionAnnotation from './RegionAnnotation';
import useOutsideEvent from '../common/useOutsideEvent';
import { AnnotationRegion } from '../@types';
import { scaleShape } from './regionUtil';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationRegion[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
    scale: number;
};

export function RegionList({ activeId, annotations, className, onSelect = noop, scale }: Props): JSX.Element {
    const [isListening, setIsListening] = React.useState(true);
    const rootElRef = React.createRef<HTMLDivElement>();
    const sortedAnnotations = annotations.sort(({ target: targetA }, { target: targetB }) => {
        const { shape: shapeA } = targetA;
        const { shape: shapeB } = targetB;

        // Render the smallest annotations last to ensure they are always clickable
        return shapeA.height * shapeA.width > shapeB.height * shapeB.width ? -1 : 1;
    });

    // Document-level event handlers for focus and pointer control
    useOutsideEvent('click', rootElRef, (): void => onSelect(null));
    useOutsideEvent('mousedown', rootElRef, (): void => setIsListening(false));
    useOutsideEvent('mouseup', rootElRef, (): void => setIsListening(true));

    return (
        <div ref={rootElRef} className={classNames(className, { 'is-listening': isListening })}>
            {sortedAnnotations.map(({ id, target }) => (
                <RegionAnnotation
                    key={id}
                    annotationId={id}
                    isActive={activeId === id}
                    onSelect={onSelect}
                    shape={scaleShape(target.shape, scale)}
                />
            ))}
        </div>
    );
}

export default React.memo(RegionList);
