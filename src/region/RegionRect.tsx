import * as React from 'react';
import classNames from 'classnames';
import './RegionRect.scss';

type Props = {
    className?: string;
    height?: number;
    width?: number;
    x?: number;
    y?: number;
};

export function RegionRect(props: Props, ref: React.Ref<SVGRectElement>): JSX.Element {
    const { className, height = 0, width = 0, x = 0, y = 0 } = props;

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
