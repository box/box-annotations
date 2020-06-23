import * as React from 'react';

export default class ReplyForm extends React.Component<{ children: React.ReactNode }> {
    name = 'ReplyFormMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
