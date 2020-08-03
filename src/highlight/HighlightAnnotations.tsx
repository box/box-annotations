import * as React from 'react';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import { AnnotationHighlight } from '../@types';

import './HighlightAnnotations.scss';

type Props = {
    annotations: AnnotationHighlight[];
    isCreating: boolean;
    setActiveAnnotationId: (annotationId: string | null) => void;
};

export default class HighlightAnnotations extends React.PureComponent<Props> {
    static defaultProps = {
        annotations: [],
        isCreating: false,
    };

    handleAnnotationActive = (annotationId: string | null): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
    };

    render(): JSX.Element {
        const { annotations, isCreating } = this.props;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <HighlightList
                    annotations={annotations}
                    className="ba-HighlightAnnotations-list"
                    onSelect={this.handleAnnotationActive}
                />

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}
            </>
        );
    }
}
