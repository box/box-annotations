import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveAnnotationIdAction } from '../store/annotations';

export default function DeselectListener(): null {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const handleMouseDown = (event: MouseEvent): void => {
            // Popup is portaled to body, so its clicks reach this listener.
            if ((event.target as Element | null)?.closest?.('.ba-PopupV2')) return;
            dispatch(setActiveAnnotationIdAction(null));
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
        };
    });

    return null;
}
