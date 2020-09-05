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
    getCreatorMessage,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getIsPromoting,
    getIsSelecting,
    getSelectionForLocation,
    isCreatorStagedHighlight,
    Mode,
    resetCreatorAction,
    SelectionItem,
    setActiveAnnotationIdAction,
    setIsPromotingAction,
    setMessageAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import { createHighlightAction } from './actions';
import { isHighlight } from './highlightUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    isCreating: boolean;
    isPromoting: boolean;
    isSelecting: boolean;
    message: string;
    selection: SelectionItem | null;
    staged: CreatorItemHighlight | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
        isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
        isPromoting: getIsPromoting(state),
        isSelecting: getIsSelecting(state),
        message: getCreatorMessage(state),
        selection: getSelectionForLocation(state, location),
        staged: isCreatorStagedHighlight(staged) ? staged : null,
        status: getCreatorStatus(state),
    };
};

export const mapDispatchToProps = {
    createHighlight: createHighlightAction,
    resetCreator: resetCreatorAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setIsPromoting: setIsPromotingAction,
    setMessage: setMessageAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
