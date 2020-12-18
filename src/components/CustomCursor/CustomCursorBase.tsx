import React from 'react';
import classNames from 'classnames';
import './CustomCursorBase.scss';

export type Props = {
    className?: string;
    children?: React.ReactNode;
    getGlobalPosition?: (x: number, y: number) => [number, number];
};

export type CustomCursor = HTMLDivElement;

const CustomCursorBase = (props: Props): JSX.Element => {
    const { className, children, getGlobalPosition } = props;
    const cursorRef = React.useRef<CustomCursor>(null);

    const handleMouseMove = React.useCallback(
        ({ clientX, clientY }: MouseEvent): void => {
            const { current: cursorEl } = cursorRef;

            if (!cursorEl) {
                return;
            }
            const [left, top] = getGlobalPosition ? getGlobalPosition(clientX, clientY) : [clientX, clientY];

            Object.assign(cursorEl.style, { left: `${left}px`, top: `${top}px` });
        },
        [cursorRef, getGlobalPosition],
    );

    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove]);

    return (
        <div ref={cursorRef} className={classNames('ba-CustomCursorBase', className)}>
            {children}
        </div>
    );
};

export default CustomCursorBase;
