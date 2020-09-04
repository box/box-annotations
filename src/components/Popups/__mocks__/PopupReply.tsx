import * as React from 'react';

export default class PopupReply extends React.Component<{ children: React.ReactNode }> {
    name = 'PopupReplyMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
