import * as React from 'react';
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
    const { className, isActive, onMount = noop, shape } = props;
    const id = uuid.v4();

    React.useEffect(() => {
        onMount(id);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={ref}
            className={classNames('ba-RegionRect', className, { 'is-active': isActive })}
            data-ba-reference-id={id}
            style={styleShape(shape)}
        />
    );
}

export default React.forwardRef(RegionRect);
