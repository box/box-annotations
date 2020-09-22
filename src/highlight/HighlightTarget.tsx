import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { getIsCurrentFileVersion } from '../store';
import { Rect } from '../@types/model';
import './HighlightTarget.scss';

type Props = {
    annotationId: string;
    className?: string;
    onHover?: (annotationId: string | null) => void;
    onSelect?: (annotationId: string) => void;
    shapes: Array<Rect>;
};

export type HighlightTargetRef = HTMLAnchorElement;

const HighlightTarget = (props: Props, ref: React.Ref<HighlightTargetRef>): JSX.Element => {
    const { annotationId, className, onHover = noop, onSelect = noop, shapes } = props;
    const isCurrentFileVersion = ReactRedux.useSelector(getIsCurrentFileVersion);

    const handleFocus = (): void => {
        onSelect(annotationId);
    };

    const handleMouseEnter = (): void => {
        onHover(annotationId);
    };

    const handleMouseLeave = (): void => {
        onHover(null);
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={ref}
            className={classNames('ba-HighlightTarget', className)}
            data-resin-iscurrent={isCurrentFileVersion}
            data-resin-itemid={annotationId}
            data-resin-target="highlightText"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            href="#"
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
        >
            {shapes.map(rect => {
                const { height, width, x, y } = rect;
                return (
                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                    <rect
                        key={`${annotationId}-${x}-${y}-${width}-${height}`}
                        className="ba-HighlightTarget-rect"
                        fill="none"
                        height={`${height}%`}
                        width={`${width}%`}
                        x={`${x}%`}
                        y={`${y}%`}
                    />
                );
            })}
        </a>
    );
};

export { HighlightTarget as HighlightTargetComponent };

export default React.forwardRef(HighlightTarget);
