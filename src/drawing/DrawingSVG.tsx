import React from 'react';
import classNames from 'classnames';

export type Props = {
    children: React.ReactNode;
    className?: string;
};

export type DrawingSVGRef = SVGSVGElement;

export function DrawingSVG({ className, children, ...rest }: Props, ref: React.Ref<DrawingSVGRef>): JSX.Element {
    return (
        <svg
            ref={ref}
            className={classNames('ba-DrawingSVG', className)}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            {...rest}
        >
            <defs>
                <filter id="ba-DrawingSVG-shadow" primitiveUnits="objectBoundingBox">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" />
                    <feComponentTransfer>
                        <feFuncA slope="0.8" type="linear" />
                    </feComponentTransfer>
                </filter>
            </defs>
            {children}
        </svg>
    );
}

export default React.forwardRef(DrawingSVG);
