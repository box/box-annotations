import React from 'react';
import * as uuid from 'uuid';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { Shape } from '../@types';
import { styleShape } from './regionUtil';
import './RegionRect.scss';

type Props = {
    className?: string;
    isActive?: boolean;
    onMount?: (uuid: string) => void;
    shape?: Shape;
};

export type RegionRectRef = HTMLDivElement;

export function RegionRect(props: Props, ref: React.Ref<RegionRectRef>): JSX.Element {
    const uuidRef = React.useRef<string>(uuid.v4());
    const { className, isActive, onMount = noop, shape } = props;

    React.useEffect(() => {
        onMount(uuidRef.current);
    }, [onMount]);

    return (
        <div
            ref={ref}
            className={classNames('ba-RegionRect', className, { 'is-active': isActive })}
            data-ba-reference-id={uuidRef.current}
            style={styleShape(shape)}
        />
    );
}

export default React.forwardRef(RegionRect);
