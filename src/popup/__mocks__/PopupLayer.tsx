import * as React from 'react';

export default class PopupLayer extends React.Component<{ children: React.ReactNode }> {
    name = 'PopupLayerMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
