import * as React from 'react';

export default class HighlightTarget extends React.Component<{ children: React.ReactNode }> {
    name = 'HighlightTargetMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
