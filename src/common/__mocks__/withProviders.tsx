import * as React from 'react';

export default function withProviders(Component: React.ComponentType) {
    return function RootProvider(props = {}): JSX.Element {
        return <Component {...props} />;
    };
}
