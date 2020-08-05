import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { bdlYellorange } from 'box-ui-elements/es/styles/variables';
import { getIsCurrentFileVersion } from '../store';
import { MOUSE_PRIMARY } from '../constants';
import { Rect } from '../@types/model';
import './HighlightAnnotation.scss';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    rects: Array<Rect>;
};

export type HighlightAnnotationRef = HTMLAnchorElement;

const HighlightAnnotation = (props: Props, ref: React.Ref<HighlightAnnotationRef>): JSX.Element => {
    const { annotationId, className, isActive, onSelect = noop, rects } = props;
    const isCurrentFileVersion = ReactRedux.useSelector(getIsCurrentFileVersion);
    const [isHover, setIsHover] = React.useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HighlightAnnotationRef>): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    const handleFocus = (): void => {
        onSelect(annotationId);
    };

    const handleMouseDown = (event: React.MouseEvent<HighlightAnnotationRef>): void => {
        if (event.buttons !== MOUSE_PRIMARY) {
            return;
        }

        onSelect(annotationId);

        event.preventDefault(); // Prevents focus from leaving the anchor immediately in some browsers
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
    };

    const handleMouseOut = (): void => {
        if (isHover) {
            setIsHover(false);
        }
    };

    const handleMouseOver = (): void => {
        if (!isHover) {
            setIsHover(true);
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={ref}
            className={classNames('ba-HighlightAnnotation', className, { 'is-active': isActive, 'is-hover': isHover })}
            data-resin-iscurrent={isCurrentFileVersion}
            data-resin-itemid={annotationId}
            data-resin-target="highlightText"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            href="#"
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={handleMouseDown}
            role="button"
            tabIndex={0}
        >
            {rects.map(rect => {
                const { height, width, x, y } = rect;
                return (
                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                    <rect
                        key={`${annotationId}-${x}-${y}-${width}-${height}`}
                        className="ba-HighlightAnnotation-rect"
                        fill={bdlYellorange}
                        height={`${height}%`}
                        onMouseOut={handleMouseOut}
                        onMouseOver={handleMouseOver}
                        width={`${width}%`}
                        x={`${x}%`}
                        y={`${y}%`}
                    />
                );
            })}
        </a>
    );
};

export { HighlightAnnotation as HighlightAnnotationComponent };

export default React.forwardRef(HighlightAnnotation);
