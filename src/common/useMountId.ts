import React from 'react';
import * as uuid from 'uuid';

// Returns a generated uuid, then calls the provided callback via an effect
export default function useMountId(callback: (uuid: string) => void): string {
    const uuidRef = React.useRef<string>(uuid.v4());

    // The callback is only invoked after the parent component has rendered
    React.useEffect(() => {
        callback(uuidRef.current);
    }, [callback]);

    return uuidRef.current;
}
