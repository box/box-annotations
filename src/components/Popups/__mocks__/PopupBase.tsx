import * as React from 'react';

export default class PopupBase extends React.Component<{ children: React.ReactNode }> {
    name = 'PopupBaseMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
