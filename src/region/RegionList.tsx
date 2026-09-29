import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import RegionAnnotation from './RegionAnnotation';
import useIsListInteractive from '../common/useIsListInteractive';
import { AnnotationRegion } from '../@types';
import { checkValue } from '../utils/util';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationRegion[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function filterRegion({ target }: AnnotationRegion): boolean {
    const { shape } = target;
    const { height, width, x, y } = shape;

    return checkValue(height) && checkValue(width) && checkValue(x) && checkValue(y);
}

export function sortRegion({ target: targetA }: AnnotationRegion, { target: targetB }: AnnotationRegion): number {
    const { shape: shapeA } = targetA;
    const { shape: shapeB } = targetB;

    // Render the smallest annotations last to ensure they are always clickable
    return shapeA.height * shapeA.width > shapeB.height * shapeB.width ? -1 : 1;
}

export function RegionList({ activeId, annotations, className, onSelect = noop }: Props): JSX.Element {
    const isListening = useIsListInteractive();
    const rootElRef = React.createRef<HTMLDivElement>();

    return (
        <div
            ref={rootElRef}
            className={classNames(className, { 'is-listening': isListening })}
            data-resin-component="regionList"
        >
            {annotations
                .filter(filterRegion)
                .sort(sortRegion)
                .map(annotation => (
                    <RegionAnnotation
                        key={annotation.id}
                        annotationId={annotation.id}
                        commentMessage={annotation.description?.message}
                        isActive={activeId === annotation.id}
                        onSelect={onSelect}
                        shape={annotation.target.shape}
                    />
                ))}
        </div>
    );
}

export default React.memo(RegionList);
