import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    CreatorItemHighlight,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getIsPromoting,
    getIsSelecting,
    getSelectionForLocation,
    isCreatorStagedHighlight,
    Mode,
    SelectionItem,
    setActiveAnnotationIdAction,
    setIsPromotingAction,
    setReferenceIdAction,
    setSelectionAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import { isHighlight } from './highlightUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    isCreating: boolean;
    isPending: boolean;
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
        isPending: getCreatorStatus(state) === CreatorStatus.pending,
        isPromoting: getIsPromoting(state),
        isSelecting: getIsSelecting(state),
        selection: getSelectionForLocation(state, location),
        staged: isCreatorStagedHighlight(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setIsPromoting: setIsPromotingAction,
    setReferenceId: setReferenceIdAction,
    setSelection: setSelectionAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
