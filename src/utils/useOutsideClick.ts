import { useEffect } from 'react';
import noop from 'lodash/noop';
import { Annotation } from '../@types';

// Returns a hook that checks when a mousedown event is fired on the document whether the mousedown event
// occurred outside of the provided element reference
export default function useOutsideClick(
    annotations: Annotation[],
    ref: React.RefObject<Element>,
    callback: () => void = noop,
): void {
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
    }, [annotations, callback, ref]);
}
