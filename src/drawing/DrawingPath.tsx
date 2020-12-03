import React from 'react';

type Props = {
    pathCommands?: string;
} & React.SVGProps<DrawingPathRef>;

export type DrawingPathRef = SVGPathElement;

const DrawingPath = (props: Props, ref: React.Ref<SVGPathElement>): JSX.Element => {
    const { pathCommands, ...rest } = props;

    return <path ref={ref} d={pathCommands} strokeLinecap="round" vectorEffect="non-scaling-stroke" {...rest} />;
};

export default React.forwardRef(DrawingPath);
