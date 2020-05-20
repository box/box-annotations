import classNames from 'classnames';
import * as React from 'react';
import AnnotationTarget from '../components/AnnotationTarget';
import RegionRect from './RegionRect';
import { Rect } from '../@types';
import './RegionAnnotation.scss';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    shape: Rect;
};

const RegionAnnotation = (props: Props, ref: React.Ref<HTMLAnchorElement>): JSX.Element => {
    const { isActive, shape, ...rest } = props;
    const className = classNames('ba-RegionAnnotation', { 'is-active': isActive });

    return (
        <AnnotationTarget ref={ref} className={className} isActive={isActive} {...rest}>
            <RegionRect {...shape} />
        </AnnotationTarget>
    );
};

export default React.forwardRef(RegionAnnotation);
