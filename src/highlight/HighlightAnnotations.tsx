import * as React from 'react';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import { AnnotationHighlight } from '../@types';

import './HighlightAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
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
        const { activeAnnotationId, annotations, isCreating } = this.props;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <HighlightList
                    activeId={activeAnnotationId}
                    annotations={annotations}
                    onSelect={this.handleAnnotationActive}
                />

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}
            </>
        );
    }
}
