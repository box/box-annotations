import React from 'react';
import * as ReactRedux from 'react-redux';
import * as uuid from 'uuid';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { getIsCurrentFileVersion } from '../store';
import { MOUSE_PRIMARY } from '../constants';
import { Rect } from '../@types/model';
import './HighlightTarget.scss';

export type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onHover?: (annotationId: string | null) => void;
    onMount?: (uuid: string) => void;
    onSelect?: (annotationId: string) => void;
    shapes: Array<Rect>;
};

export type HighlightTargetRef = HTMLAnchorElement;

const HighlightTarget = (props: Props, ref: React.Ref<HighlightTargetRef>): JSX.Element => {
    const { annotationId, className, isActive, onHover = noop, onMount = noop, onSelect = noop, shapes } = props;
    const uuidRef = React.useRef<string>(uuid.v4());
    const isCurrentFileVersion = ReactRedux.useSelector(getIsCurrentFileVersion);

    const handleClick = (event: React.MouseEvent<HighlightTargetRef>): void => {
        // These are needed to prevent the anchor link from being followed and updating the url location
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    const handleFocus = (): void => {
        onSelect(annotationId);
    };

    const handleMouseEnter = (): void => {
        onHover(annotationId);
    };

    const handleMouseLeave = (): void => {
        onHover(null);
    };

    const handleMouseDown = (event: React.MouseEvent<HighlightTargetRef>): void => {
        if (event.buttons !== MOUSE_PRIMARY) {
            return;
        }

        event.preventDefault(); // Prevents focus from leaving the button immediately in some browsers
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
        if (event.currentTarget.focus) {
            // Buttons do not receive focus in Firefox and Safari on MacOS; triggers handleFocus
            event.currentTarget.focus();
        } else {
            // IE11 won't apply the focus to the SVG anchor and does not have focus function; call handleFocus directly
            handleFocus();
        }
    };

    React.useEffect(() => {
        onMount(uuidRef.current);
    }, [onMount]);

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={ref}
            className={classNames('ba-HighlightTarget', className, { 'is-active': isActive })}
            data-ba-reference-id={uuidRef.current}
            data-resin-iscurrent={isCurrentFileVersion}
            data-resin-itemid={annotationId}
            data-resin-target="highlightText"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            href="#"
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={handleMouseDown}
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
