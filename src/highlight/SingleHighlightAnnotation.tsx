import React from 'react';
import classNames from 'classnames';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightCanvas from './HighlightCanvas';
import HighlightSvg from './HighlightSvg';
import { AnnotationHighlight } from '../@types';

type Props = {
    annotation: Pick<AnnotationHighlight, 'id' | 'target'>;
    className?: string;
};

const SingleHighlightAnnotation = (
    { annotation, className }: Props,
    ref: React.Ref<HTMLAnchorElement>,
): JSX.Element => {
    const {
        id,
        target: { shapes },
    } = annotation;
    return (
        <div className={classNames('ba-SingleHighlightAnnotation', className)}>
            <HighlightCanvas annotations={[annotation]} />
            <HighlightSvg>
                <HighlightAnnotation ref={ref} annotationId={id} rects={shapes} />
            </HighlightSvg>
        </div>
    );
};

export default React.forwardRef(SingleHighlightAnnotation);
