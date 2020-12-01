import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { MOUSE_PRIMARY } from '../constants';
import { Shape } from '../@types';
import { styleShape } from './regionUtil';
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

    const handleFocus = (): void => {
        onSelect(annotationId);
    };
    const handleMouseDown = (event: React.MouseEvent<RegionAnnotationRef>): void => {
        if (event.buttons !== MOUSE_PRIMARY) {
            return;
        }

        event.preventDefault(); // Prevents focus from leaving the button immediately in some browsers
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
        event.currentTarget.focus(); // Buttons do not receive focus in Firefox and Safari on MacOS; triggers handleFocus
    };

    return (
        <button
            ref={ref}
            className={classNames('ba-RegionAnnotation', className, { 'is-active': isActive })}
            data-resin-itemid={annotationId}
            data-resin-target="highlightRegion"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            onFocus={handleFocus}
            onMouseDown={handleMouseDown}
            style={styleShape(shape)}
            type="button"
        />
    );
};

export default React.forwardRef(RegionAnnotation);
