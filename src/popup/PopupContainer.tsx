import { connect } from 'react-redux';
import PopupLayer from './PopupLayer';
import withProviders from '../common/withProviders';
import {
    AppState,
    CreatorItem,
    CreatorStatus,
    getAnnotationMode,
    getCreatorMessage,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getIsPromoting,
    Mode,
    resetCreatorAction,
    setMessageAction,
    getCreatorReferenceId,
} from '../store';
import { getActiveAnnotationId } from '../store/annotations/selectors';
import { isFeatureEnabled } from '../store/options';
import { createDrawingAction } from '../drawing/actions';
import { createHighlightAction } from '../highlight/actions';
import { createRegionAction } from '../region';

export type Props = {
    activeAnnotationId: string | null;
    isPromoting: boolean;
    isThreadedAnnotation?: boolean;
    message: string;
    mode: Mode;
    referenceId: string | null;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        activeAnnotationId: getActiveAnnotationId(state),
        isPromoting: getIsPromoting(state),
        isThreadedAnnotation: isFeatureEnabled(state, 'isThreadedAnnotation'),
        message: getCreatorMessage(state),
        mode: getAnnotationMode(state),
        referenceId: getCreatorReferenceId(state),
        staged: getCreatorStagedForLocation(state, location),
        status: getCreatorStatus(state),
    };
};

export const mapDispatchToProps = {
    createDrawing: createDrawingAction,
    createHighlight: createHighlightAction,
    createRegion: createRegionAction,
    resetCreator: resetCreatorAction,
    setMessage: setMessageAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(PopupLayer));
