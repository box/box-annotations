import { useEffect } from 'react';
import noop from 'lodash/noop';

// Utilizes the useEffect hook to handle when a click event is fired on the document whether the click event
// occurred outside of the provided element reference
export default function useOutsideClick(ref: React.RefObject<Element>, callback: () => void = noop): void {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            const hasElementClicked = !!ref?.current?.contains(event.target as Node);

            if (!hasElementClicked) {
                callback();
            }
        }

        // Bind the event listener
        document.addEventListener('click', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('click', handleClickOutside);
        };
    }, [callback, ref]);
}
