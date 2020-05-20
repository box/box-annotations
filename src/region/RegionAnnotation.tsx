import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { Shape, styleShape } from './regionUtil';
import './RegionAnnotation.scss';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    shape: Shape;
};

export type RegionAnnotationRef = HTMLButtonElement;

export const RegionAnnotation = (props: Props, ref: React.Ref<RegionAnnotationRef>): JSX.Element => {
    const { annotationId, className, isActive, onSelect = noop, shape } = props;

    const cancelEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
    };
    const handleBlur = (event: React.SyntheticEvent): void => {
        cancelEvent(event);
    };
    const handleClick = (event: React.MouseEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };
    const handleFocus = (event: React.SyntheticEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };

    return (
        <button
            ref={ref}
            className={classNames('ba-RegionAnnotation', className, { 'is-active': isActive })}
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            onBlur={handleBlur}
            onClick={handleClick}
            onFocus={handleFocus}
            style={styleShape(shape)}
            type="button"
        />
    );
};

export default React.forwardRef(RegionAnnotation);
