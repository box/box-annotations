import * as React from 'react';
import HighlightCanvas from './HighlightCanvas';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import { AnnotationHighlight } from '../@types';
import { isValidHighlight, sortHighlight } from './highlightUtil';

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
        const sortedAnnotations = annotations.filter(isValidHighlight).sort(sortHighlight);

        return (
            <>
                {/* Layer 1: Saved annotations -- visual highlights */}
                <HighlightCanvas activeId={activeAnnotationId} annotations={sortedAnnotations} />

                {/* Layer 2: Saved annotations -- interactable highlights */}
                <HighlightList annotations={sortedAnnotations} onSelect={this.handleAnnotationActive} />

                {/* Layer 3: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}
            </>
        );
    }
}
