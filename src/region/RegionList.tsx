import * as React from 'react';
import noop from 'lodash/noop';
import RegionAnnotation from './RegionAnnotation';
import { scaleShape } from './regionUtil';
import useOutsideClick from '../utils/useOutsideClick';
import { AnnotationRegion } from '../@types';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationRegion[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
    scale: number;
};

export function RegionList({ activeId, annotations, className, onSelect = noop, scale }: Props): JSX.Element {
    const sortedAnnotations = annotations.sort(({ target: targetA }, { target: targetB }) => {
        const { shape: shapeA } = targetA;
        const { shape: shapeB } = targetB;

        // Render the smallest annotations last to ensure they are always clickable
        return shapeA.height * shapeA.width > shapeB.height * shapeB.width ? -1 : 1;
    });

    const refs = sortedAnnotations.map(() => React.createRef<HTMLAnchorElement>());

    const handleOutsideClick = (): void => onSelect(null);

    useOutsideClick(sortedAnnotations, refs, handleOutsideClick);

    return (
        <svg className={className}>
            {sortedAnnotations.map(({ id, target }, index) => (
                <RegionAnnotation
                    key={id}
                    ref={refs[index]}
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
