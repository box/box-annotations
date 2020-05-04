import * as React from 'react';
import classNames from 'classnames';
import { Rect } from '../@types';
import './RegionRect.scss';

type Props = {
    className?: string;
    shape?: Rect | null;
};

export function RegionRect({ className, shape }: Props, ref: React.Ref<SVGRectElement>): JSX.Element | null {
    if (!shape) {
        return null;
    }

    const { height, width, x, y } = shape;

    return (
        <rect
            ref={ref}
            className={classNames('ba-RegionRect', className)}
            height={height}
            rx={6}
            width={width}
            x={x}
            y={y}
        />
    );
}

export default React.forwardRef(RegionRect);
