import React from 'react';

export type Props = React.SVGProps<DrawingPathRef> & {
    pathCommands?: string;
};

export type DrawingPathRef = SVGPathElement;

const DrawingPath = (props: Props, ref: React.Ref<SVGPathElement>): JSX.Element => {
    const { pathCommands, ...rest } = props;

    return <path ref={ref} d={pathCommands} strokeLinecap="round" vectorEffect="non-scaling-stroke" {...rest} />;
};

export { DrawingPath as DrawingPathBase };

export default React.forwardRef(DrawingPath);
