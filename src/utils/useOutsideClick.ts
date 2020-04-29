import { useEffect } from 'react';
import { Annotation } from '../@types';

// Returns a hook that checks when a mousedown event is fired on the document whether the mousedown event
// occurred outside of any of the provided element references
export default function useOutsideClick(
    annotations: Annotation[],
    refs: React.RefObject<HTMLElement>[],
    callback?: () => void,
): void {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            const hasElementClicked = refs.reduce(
                (beenClicked, ref) => beenClicked || !!ref?.current?.contains(event.target as Node),
                false,
            );

            if (!hasElementClicked && callback) {
                callback();
            }
        }

        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [annotations, callback, refs]);
}
