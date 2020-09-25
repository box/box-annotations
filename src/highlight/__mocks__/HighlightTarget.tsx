import * as React from 'react';

export default class HighlightTarget extends React.Component<{ children: React.ReactNode }> {
    name = 'HighlightTargetMock';

    getBoundingClientRect(): Partial<DOMRect> {
        return {
            height: 10,
            width: 10,
            top: 10,
            left: 10,
        };
    }

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
