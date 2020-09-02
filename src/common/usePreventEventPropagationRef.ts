import React from 'react';

const handleEvent = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
};

export default function usePreventEventPropagationRef<T extends HTMLElement>(...args: string[]): (element: T) => void {
    const [element, setElement] = React.useState<T | null>(null);
    const ref = React.useCallback(
        (el: T | null) => {
            setElement(el);
        },
        [args], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const cleanup = (): void => {
        if (element === null) {
            return;
        }

        args.forEach(event => element.removeEventListener(event, handleEvent));
    };

    React.useEffect(() => {
        if (element !== null) {
            args.forEach(event => element.addEventListener(event, handleEvent));
        }
        return cleanup;
    }, [element, args]); // eslint-disable-line react-hooks/exhaustive-deps

    return ref;
}
