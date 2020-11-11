import * as React from 'react';

// Utilizes the useEffect hook to handle when an event is fired on the document, but outside of the specified element
export default function useOutsideEvent(
    type: string,
    ref?: React.RefObject<Element> | Element | null,
    callback?: () => void,
): void {
    React.useEffect(() => {
        function handleEvent(event: Event): void {
            const element = ref instanceof Element ? ref : ref?.current;
            const containsEventTarget = !!element?.contains(event.target as Node);

            if (callback && !containsEventTarget) {
                callback();
            }
        }

        // Bind the event listener
        document.addEventListener(type, handleEvent);

        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener(type, handleEvent);
        };
    }, [callback, ref, type]);
}
