import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveAnnotationIdAction } from '../store/annotations';

export default function MouseeventListener(): null {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const handleMouseDown = (): void => {
            dispatch(setActiveAnnotationIdAction(null));
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
        };
    });

    return null;
}
