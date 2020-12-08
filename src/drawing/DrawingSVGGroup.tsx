import React from 'react';
import noop from 'lodash/noop';
import * as uuid from 'uuid';

export type Props = React.SVGAttributes<SVGGElement> & {
    children: React.ReactNode;
    onMount?: (uuid: string) => void;
};

export type DrawingSVGGroup = SVGGElement;

export function DrawingSVGGroup(
    { children, onMount = noop, ...rest }: Props,
    ref: React.Ref<DrawingSVGGroup>,
): JSX.Element {
    const uuidRef = React.useRef<string>(uuid.v4());

    React.useEffect(() => {
        onMount(uuidRef.current);
    }, [onMount]);

    return (
        <g ref={ref} data-ba-reference-id={uuidRef.current} {...rest}>
            {children}
        </g>
    );
}

export default React.forwardRef(DrawingSVGGroup);
