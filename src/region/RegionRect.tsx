import * as React from 'react';
import { Rect } from '../@types';
import './RegionRect.scss';

type Props = {
    shape?: Rect | null;
};

export function RegionRect({ shape }: Props, ref: React.Ref<SVGRectElement>): JSX.Element | null {
    if (!shape) {
        return null;
    }

    const { height, width, x, y } = shape;

    return <rect ref={ref} className="ba-RegionRect" height={height} rx={6} width={width} x={x} y={y} />;
}

export default React.forwardRef(RegionRect);
