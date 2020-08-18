import * as React from 'react';

export default class HighlightAnnotations extends React.Component<{ children: React.ReactNode }> {
    name = 'HighlightAnnotationsMock';

    render(): JSX.Element {
        const { children } = this.props;

        return <div>{children}</div>;
    }
}
