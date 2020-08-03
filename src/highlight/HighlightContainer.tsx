import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import { AppState, getAnnotationsForLocation, getAnnotationMode, setActiveAnnotationIdAction } from '../store';
import { isHighlight } from './highlightUtil';

export type Props = {
    annotations: AnnotationHighlight[];
    isCreating: boolean;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => ({
    annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
    isCreating: getAnnotationMode(state) === 'highlight',
});

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
