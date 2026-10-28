import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    CreatorItemHighlight,
    CreatorStatus,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getIsBlueprintToolbarEnabled,
    getIsPromoting,
    getIsSelecting,
    getRotation,
    getSelectionForLocation,
    getVisibleActiveAnnotationId,
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
    isBlueprintToolbarEnabled: boolean;
    isCreating: boolean;
    isPending: boolean;
    isPromoting: boolean;
    isSelecting: boolean;
    rotation: number;
    selection: SelectionItem | null;
    staged: CreatorItemHighlight | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getVisibleActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
        isBlueprintToolbarEnabled: getIsBlueprintToolbarEnabled(state),
        isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
        isPending: getCreatorStatus(state) === CreatorStatus.pending,
        isPromoting: getIsPromoting(state),
        isSelecting: getIsSelecting(state),
        rotation: getRotation(state),
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
