import * as React from 'react';
import RegionAnnotation from './RegionAnnotation';
import { AnnotationRegion } from '../@types';
import { scaleShape } from './regionUtil';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationRegion[];
    className?: string;
    onSelect?: (annotationId: string) => void;
    scale: number;
};

export function RegionList({ activeId, annotations, className, onSelect, scale }: Props): JSX.Element {
    const sortedAnnotations = annotations.sort(({ target: targetA }, { target: targetB }) => {
        const { shape: shapeA } = targetA;
        const { shape: shapeB } = targetB;

        // Render the smallest annotations last to ensure they are always clickable
        return shapeA.height * shapeA.width > shapeB.height * shapeB.width ? -1 : 1;
    });

    return (
        <svg className={className}>
            {sortedAnnotations.map(({ id, target }) => (
                <RegionAnnotation
                    key={id}
                    annotationId={id}
                    isActive={activeId === id}
                    onSelect={onSelect}
                    shape={scaleShape(target.shape, scale)}
                />
            ))}
        </svg>
    );
}

export default React.memo(RegionList);
