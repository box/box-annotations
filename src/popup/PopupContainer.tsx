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
import { createDrawingAction } from '../drawing/actions';
import { createHighlightAction } from '../highlight/actions';
import { createRegionAction } from '../region';

export type Props = {
    isPromoting: boolean;
    message: string;
    mode: Mode;
    referenceId: string | null;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        isPromoting: getIsPromoting(state),
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
