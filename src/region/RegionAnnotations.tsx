import * as React from 'react';
import { Annotation, TargetRegion } from '../@types';
import RegionAnnotation from './RegionAnnotation';
import './RegionAnnotations.scss';

type Props = {
    annotations: Annotation[];
};

export default function RegionAnnotations({ annotations }: Props): JSX.Element {
    return (
        <svg className="ba-Regions">
            {annotations.map(({ id, target }) => (
                <RegionAnnotation key={id} annotationId={id} shape={(target as TargetRegion).shape} />
            ))}
        </svg>
    );
}
