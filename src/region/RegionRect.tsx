import * as React from 'react';
import classNames from 'classnames';
import { Shape } from '../@types';
import { styleShape } from './regionUtil';
import './RegionRect.scss';

type Props = {
    className?: string;
    isActive?: boolean;
    shape?: Shape;
};

export type RegionRectRef = HTMLDivElement;

export function RegionRect(props: Props, ref: React.Ref<RegionRectRef>): JSX.Element {
    const { className, isActive, shape } = props;

    return (
        <div
            ref={ref}
            className={classNames('ba-RegionRect', className, { 'is-active': isActive })}
            style={styleShape(shape)}
        />
    );
}

export default React.forwardRef(RegionRect);
