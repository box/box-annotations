import * as React from 'react';

function ChevronLeft(props: React.SVGProps<SVGSVGElement>): JSX.Element {
    return (
        <svg
            data-testid="ChevronLeft"
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
                d="M13.293 4.293a1 1 0 1 1 1.414 1.414L8.414 12l6.293 6.293.068.076a1 1 0 0 1-1.406 1.406l-.076-.068L7 13.414a2 2 0 0 1 0-2.828l6.293-6.293Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default ChevronLeft;
