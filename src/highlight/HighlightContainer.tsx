import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    getActiveAnnotationId,
    getAnnotationsForLocation,
    getAnnotationMode,
    Mode,
    setActiveAnnotationIdAction,
} from '../store';
import { isHighlight } from './highlightUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    isCreating: boolean;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => ({
    activeAnnotationId: getActiveAnnotationId(state),
    annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
    isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
});

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
