import React from 'react';

const handleEvent = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
};

export default function usePreventEventPropagationRef<T extends HTMLElement>(...args: string[]): (element: T) => void {
    return React.useCallback(
        (element: T | null) => {
            if (element === null) {
                return;
            }

            args.forEach(event => element.addEventListener(event, handleEvent));
        },
        [args],
    );
}
