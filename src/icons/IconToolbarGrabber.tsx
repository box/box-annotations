import * as React from 'react';
import AccessibleSVG from 'box-ui-elements/es/components/accessible-svg/AccessibleSVG';

type Props = {
    /** Class for the svg */
    className?: string;
    /** Height for the svg */
    height?: number;
    /** Accessibility role for the svg */
    role?: string;
    /** A text-only string describing the icon if it's not purely decorative for accessibility */
    title?: React.ReactNode;
    /** View box for the svg */
    viewBox?: string;
    /** Width for the svg */
    width?: number;
};

const IconToolbarGrabber16 = (props: Props): JSX.Element => (
    <AccessibleSVG height={16} viewBox="0 0 16 16" width={16} {...props}>
        <g fill="none" fillRule="evenodd">
            <path
                d="M4,0 C4.27614237,-5.07265313e-17 4.5,0.223857625 4.5,0.5 L4.5,15.5 C4.5,15.7761424 4.27614237,16 4,16 C3.72385763,16 3.5,15.7761424 3.5,15.5 L3.5,0.5 C3.5,0.223857625 3.72385763,5.07265313e-17 4,0 Z M8.25,0 C8.52614237,-5.07265313e-17 8.75,0.223857625 8.75,0.5 L8.75,15.5 C8.75,15.7761424 8.52614237,16 8.25,16 C7.97385763,16 7.75,15.7761424 7.75,15.5 L7.75,0.5 C7.75,0.223857625 7.97385763,5.07265313e-17 8.25,0 Z M12.5,0 C12.7761424,-5.07265313e-17 13,0.223857625 13,0.5 L13,15.5 C13,15.7761424 12.7761424,16 12.5,16 C12.2238576,16 12,15.7761424 12,15.5 L12,0.5 C12,0.223857625 12.2238576,5.07265313e-17 12.5,0 Z"
                fill="#000"
            />
            <path
                d="M3.5,0 C3.77614237,-5.07265313e-17 4,0.223857625 4,0.5 L4,15.5 C4,15.7761424 3.77614237,16 3.5,16 C3.22385763,16 3,15.7761424 3,15.5 L3,0.5 C3,0.223857625 3.22385763,5.07265313e-17 3.5,0 Z M7.75,0 C8.02614237,-5.07265313e-17 8.25,0.223857625 8.25,0.5 L8.25,15.5 C8.25,15.7761424 8.02614237,16 7.75,16 C7.47385763,16 7.25,15.7761424 7.25,15.5 L7.25,0.5 C7.25,0.223857625 7.47385763,5.07265313e-17 7.75,0 Z M12,0 C12.2761424,-5.07265313e-17 12.5,0.223857625 12.5,0.5 L12.5,15.5 C12.5,15.7761424 12.2761424,16 12,16 C11.7238576,16 11.5,15.7761424 11.5,15.5 L11.5,0.5 C11.5,0.223857625 11.7238576,5.07265313e-17 12,0 Z"
                fill="#909090"
            />
        </g>
    </AccessibleSVG>
);

export default IconToolbarGrabber16;
