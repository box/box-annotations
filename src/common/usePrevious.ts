import React from 'react';

// Returns the last provided value, then caches the new value via an effect
export default function usePrevious<T>(value: T): T | undefined {
    const ref = React.useRef<T>();

    // The useEffect callback is only invoked after the parent component has rendered
    React.useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
