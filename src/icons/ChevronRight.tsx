import * as React from 'react';

function ChevronRight(props: React.SVGProps<SVGSVGElement>): JSX.Element {
    return (
        <svg
            data-testid="ChevronRight"
            fill="none"
            focusable="false"
            height="1em"
            role="img"
            viewBox="0 0 24 24"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M9.293 4.293a1 1 0 0 1 1.414 0L17 10.586a2 2 0 0 1 0 2.828l-6.293 6.293a1 1 0 0 1-1.414-1.414L15.586 12 9.293 5.707a1 1 0 0 1 0-1.414Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default ChevronRight;
