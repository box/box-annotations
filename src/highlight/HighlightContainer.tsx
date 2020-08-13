import { connect } from 'react-redux';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationHighlight } from '../@types';
import {
    AppState,
    CreatorHighlight,
    CreatorItem,
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

export const isCreatorStagedHighlight = (staged: CreatorItem | null): staged is CreatorHighlight => {
    return staged?.target.type === 'highlight';
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isHighlight),
        isCreating: getAnnotationMode(state) === Mode.HIGHLIGHT,
        message: getCreatorMessage(state),
        staged: isCreatorStagedHighlight(staged) ? staged : null,
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
