import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    CreatorItemHighlight,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getIsPromoting,
    getIsSelecting,
    getSelectionForLocation,
    isCreatorStagedHighlight,
    Mode,
    SelectionItem,
    setActiveAnnotationIdAction,
    setIsPromotingAction,
    setReferenceShapeAction,
    setSelectionAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import { isHighlight } from './highlightUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    isCreating: boolean;
    isPromoting: boolean;
    isSelecting: boolean;
    selection: SelectionItem | null;
    staged: CreatorItemHighlight | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
        isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
        isPromoting: getIsPromoting(state),
        isSelecting: getIsSelecting(state),
        selection: getSelectionForLocation(state, location),
        staged: isCreatorStagedHighlight(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setIsPromoting: setIsPromotingAction,
    setReferenceShape: setReferenceShapeAction,
    setSelection: setSelectionAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
