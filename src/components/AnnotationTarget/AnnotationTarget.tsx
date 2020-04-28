import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import scrollIntoView, { Options } from 'scroll-into-view-if-needed';
import { KEYS } from 'box-ui-elements/es/constants';
import './AnnotationTarget.scss';

type Props = {
    annotationId: string;
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
};

const scrollOptions: Options = {
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
    scrollMode: 'if-needed',
};

const AnnotationTarget = (props: Props, ref: React.Ref<HTMLAnchorElement>): JSX.Element => {
    const { annotationId, children, className, isActive, onSelect = noop, ...rest } = props;
    const innerRef = React.useRef<HTMLAnchorElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLAnchorElement, [innerRef]);
    React.useEffect(() => {
        if (isActive && innerRef.current) {
            scrollIntoView(innerRef.current, scrollOptions);
        }
    }, [isActive]);

    const cancelEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
    };
    const handleBlur = (event: React.SyntheticEvent): void => {
        // Rely on the native browser blur of a focused element to determine when to de-select an annotation from
        // being the active annotation id
        cancelEvent(event);
        onSelect(null);
    };
    const handleClick = (event: React.MouseEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };
    const handleFocus = (event: React.SyntheticEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };
    const handleKeyPress = (event: React.KeyboardEvent): void => {
        if (event.key !== KEYS.enter && event.key !== KEYS.space) {
            return;
        }

        cancelEvent(event);
        onSelect(annotationId);
    };

    // We use an anchor to allow the target to be used inside of SVG shapes where buttons aren't supported
    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={innerRef}
            className={classNames('ba-AnnotationTarget', className)}
            href="#" // Needed for IE11 to handle click events properly
            onBlur={handleBlur}
            onClick={handleClick}
            onFocus={handleFocus}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex={0}
            {...rest}
        >
            {children}
        </a>
    );
};

export default React.forwardRef(AnnotationTarget);
