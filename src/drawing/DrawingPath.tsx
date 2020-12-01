import React from 'react';

interface Props extends React.ComponentPropsWithoutRef<'path'> {
    className?: string;
    pathCommands?: string;
}

export type DrawingPathRef = SVGPathElement;

const DrawingPath = (props: Props, ref: React.Ref<SVGPathElement>): JSX.Element => {
    const { className, pathCommands, ...rest } = props;

    return (
        <path
            ref={ref}
            className={className}
            d={pathCommands}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            {...rest}
        />
    );
};

export default React.forwardRef(DrawingPath);
