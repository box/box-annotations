import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveAnnotationIdAction } from '../store/annotations';

export default function DeselectListener(): null {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const handleMouseDown = (event: MouseEvent): void => {
            // Popup is portaled outside .ba-Layer; native mousedown still bubbles here.
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
