import React from 'react';
import classNames from 'classnames';
import './HighlightSvg.scss';

type Props = {
    children?: React.ReactNode;
    className?: string;
};

const HighlightSvg = ({ children, className }: Props, ref: React.Ref<SVGSVGElement>): JSX.Element => {
    return (
        <svg ref={ref} className={classNames('ba-HighlightSvg', className)}>
            {children}
        </svg>
    );
};

export default React.forwardRef(HighlightSvg);
