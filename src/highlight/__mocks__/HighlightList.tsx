import * as React from 'react';

export default class HighlightList extends React.Component<{
    children: React.ReactNode;
}> {
    name = 'HighlightListMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
