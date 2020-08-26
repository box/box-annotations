import * as React from 'react';

export default class HighlightCanvas extends React.Component<{ children: React.ReactNode }> {
    name = 'HighlightCanvasMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
