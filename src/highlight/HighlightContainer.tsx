import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    CreatorHighlight,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorMessage,
    getCreatorStagedForLocation,
    getCreatorStatus,
    Mode,
    setActiveAnnotationIdAction,
    setMessageAction,
    setStagedAction,
    setStatusAction,
    toggleAnnotationModeAction,
} from '../store';
import { isHighlight } from './highlightUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    isCreating: boolean;
    message: string;
    staged: CreatorHighlight | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
        isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
        message: getCreatorMessage(state),
        staged: (staged as CreatorHighlight)?.shapes ? (staged as CreatorHighlight) : null,
        status: getCreatorStatus(state),
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setMessage: setMessageAction,
    setMode: toggleAnnotationModeAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(HighlightAnnotations));
