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
    getCreatorReferenceShape,
} from '../store';
import { createHighlightAction } from '../highlight/actions';
import { Shape } from '../@types';
import { createRegionAction } from '../region';

export type Props = {
    isCreating: boolean;
    isPromoting: boolean;
    message: string;
    popupReference?: Shape;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        isCreating: getAnnotationMode(state) !== Mode.NONE,
        isPromoting: getIsPromoting(state),
        message: getCreatorMessage(state),
        popupReference: getCreatorReferenceShape(state),
        staged: getCreatorStagedForLocation(state, location),
        status: getCreatorStatus(state),
    };
};

export const mapDispatchToProps = {
    createHighlight: createHighlightAction,
    createRegion: createRegionAction,
    resetCreator: resetCreatorAction,
    setMessage: setMessageAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(PopupLayer));
