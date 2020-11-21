import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { MOUSE_PRIMARY } from '../../constants';

export enum Status {
    dragging = 'dragging',
    drawing = 'drawing',
    init = 'init',
}

type Props = {
    children: React.ReactNode;
    className: string;
    onDrawStart: (x: number, y: number) => void;
    onDrawStop: () => void;
    onDrawUpdate: (x: number, y: number) => void;
    onMouseOut?: () => void;
    onMouseOver?: () => void;
    status: Status;
};

type PointerCaptureRef = HTMLDivElement;

function PointerCapture(props: Props, ref: React.Ref<PointerCaptureRef>): JSX.Element {
    const {
        children,
        className,
        onDrawStart,
        onDrawStop,
        onDrawUpdate,
        onMouseOut = noop,
        onMouseOver = noop,
        status,
        ...rest
    } = props;

    // Event Handlers
    const handleClick = (event: React.MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleMouseDown = ({ buttons, clientX, clientY }: React.MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        onDrawStart(clientX, clientY);
    };
    const handleMouseMove = ({ buttons, clientX, clientY }: MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY || status === Status.init) {
            return;
        }

        onDrawUpdate(clientX, clientY);
    };
    const handleMouseOut = (): void => {
        onMouseOut();
    };
    const handleMouseOver = (): void => {
        onMouseOver();
    };
    const handleMouseUp = (): void => {
        onDrawStop();
    };
    const handleTouchCancel = (): void => {
        onDrawStop();
    };
    const handleTouchEnd = (): void => {
        onDrawStop();
    };
    const handleTouchMove = ({ targetTouches }: React.TouchEvent): void => {
        onDrawUpdate(targetTouches[0].clientX, targetTouches[0].clientY);
    };
    const handleTouchStart = ({ targetTouches }: React.TouchEvent): void => {
        onDrawStart(targetTouches[0].clientX, targetTouches[0].clientY);
    };

    React.useEffect(() => {
        // Document-level mousemove and mouseup event listeners allow the creator component to respond even if
        // the cursor leaves the drawing area before the mouse button is released, which finishes the shape
        if (status !== Status.init) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div
            ref={ref}
            className={classNames(className, 'ba-PointerCapture')}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseOut={handleMouseOut}
            onMouseOver={handleMouseOver}
            onTouchCancel={handleTouchCancel}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            role="presentation"
            {...rest}
        >
            {children}
        </div>
    );
}

export default React.forwardRef(PointerCapture);
