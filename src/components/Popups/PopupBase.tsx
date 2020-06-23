import * as React from 'react';
import classNames from 'classnames';
import './PopupBase.scss';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    attributes?: {
        [key: string]: {
            [key: string]: string;
        };
    };
    className?: string;
    styles?: {
        [key: string]: React.CSSProperties;
    };
};

export function PopupBase(props: Props, ref: React.Ref<HTMLDivElement>): JSX.Element {
    const { attributes = {}, children, className, styles = {}, ...rest } = props;

    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    return (
        <div
            ref={ref}
            className={classNames('ba-Popup', className)}
            onClick={handleEvent}
            onMouseDown={handleEvent}
            onMouseMove={handleEvent}
            onMouseUp={handleEvent}
            onTouchMove={handleEvent}
            onTouchStart={handleEvent}
            role="presentation"
            style={styles.popper}
            {...attributes.popper}
            {...rest}
        >
            <div className="ba-Popup-arrow" style={styles.arrow} {...attributes.arrow} />
            <div className="ba-Popup-content">{children}</div>
        </div>
    );
}

export default React.forwardRef(PopupBase);
