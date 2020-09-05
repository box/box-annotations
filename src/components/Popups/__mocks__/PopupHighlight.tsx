import * as React from 'react';

export default class PopupHighlight extends React.Component<{ children: React.ReactNode }> {
    name = 'PopupHighlightMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
