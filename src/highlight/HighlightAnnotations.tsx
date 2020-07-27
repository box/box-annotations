import * as React from 'react';
import HighlightCreator from './HighlightCreator';

import './HighlightAnnotations.scss';

type Props = {
    isCreating: boolean;
};

export default class HighlightAnnotations extends React.PureComponent<Props> {
    static defaultProps = {
        isCreating: false,
    };

    render(): JSX.Element {
        const { isCreating } = this.props;

        return (
            <>
                {/* Layer 1: Saved annotations */}

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}
            </>
        );
    }
}
