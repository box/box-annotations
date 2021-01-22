import React from 'react';
import classNames from 'classnames';
import * as uuid from 'uuid';
import SVGFilterContext from './SVGFilterContext';

export type Props = {
    children: React.ReactNode;
    className?: string;
};

export type DrawingSVGRef = SVGSVGElement;

export function DrawingSVG({ className, children, ...rest }: Props, ref: React.Ref<DrawingSVGRef>): JSX.Element {
    const { current: filterID } = React.useRef(`ba-DrawingSVG-shadow_${uuid.v4()}`);

    return (
        <svg
            ref={ref}
            className={classNames('ba-DrawingSVG', className)}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            {...rest}
        >
            <defs>
                <filter filterUnits="userSpaceOnUse" id={filterID}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                </filter>
            </defs>
            <SVGFilterContext.Provider value={filterID}>{children}</SVGFilterContext.Provider>
        </svg>
    );
}

export default React.forwardRef(DrawingSVG);
