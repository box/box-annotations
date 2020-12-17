import React from 'react';
import noop from 'lodash/noop';
import useMountId from '../common/useMountId';

export type Props = React.SVGAttributes<SVGGElement> & {
    children?: React.ReactNode;
    onMount?: (uuid: string) => void;
};

export type DrawingSVGGroup = SVGGElement;

export function DrawingSVGGroup(props: Props, ref: React.Ref<DrawingSVGGroup>): JSX.Element {
    const { children, onMount = noop, ...rest } = props;
    const uuid = useMountId(onMount);

    return (
        <g ref={ref} data-ba-reference-id={uuid} {...rest}>
            {children}
        </g>
    );
}

export default React.forwardRef(DrawingSVGGroup);
