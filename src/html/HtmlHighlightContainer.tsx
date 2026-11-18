import { connect } from 'react-redux';
import HtmlHighlightAnnotations from './HtmlHighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight, Rect, TargetHighlight } from '../@types';
import { AppState } from '../store';
import {
    mapDispatchToProps,
    mapStateToProps as mapHighlightStateToProps,
    Props,
} from '../highlight/HighlightContainer';

export type GetShapes = (target: TargetHighlight) => Rect[] | null;

type OwnProps = {
    getShapes: GetShapes;
    location: number;
};

// Replaces stored shapes with shapes found from the highlight text in the current layout.
// Highlights whose text is not found are left out.
export const mapStateToProps = (state: AppState, { getShapes, location }: OwnProps): Props => {
    const props = mapHighlightStateToProps(state, { location });

    return {
        ...props,
        annotations: props.annotations.reduce<AnnotationHighlight[]>((annotations, annotation) => {
            const shapes = getShapes(annotation.target);
            return shapes ? [...annotations, { ...annotation, target: { ...annotation.target, shapes } }] : annotations;
        }, []),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HtmlHighlightAnnotations));
