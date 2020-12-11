import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import {
    addDrawingPathGroupAction,
    getDrawingDrawnPathGroupsForLocation,
    getStashedDrawnPathGroupsForLocation,
    redoDrawingPathGroupAction,
    resetDrawingAction,
    undoDrawingPathGroupAction,
} from '../store/drawing';
import { AnnotationDrawing, PathGroup } from '../@types';
import {
    AppState,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStatus,
    isFeatureEnabled,
    Mode,
    setActiveAnnotationIdAction,
    setReferenceIdAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import { isDrawing } from './drawingUtil';
import { setupDrawingAction } from './actions';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    canShowPopupToolbar: boolean;
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
    stashedPathGroups: Array<PathGroup>;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const creatorStatus = getCreatorStatus(state);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isDrawing),
        canShowPopupToolbar: creatorStatus === CreatorStatus.started,
        drawnPathGroups: getDrawingDrawnPathGroupsForLocation(state, location),
        isCreating:
            isFeatureEnabled(state, 'drawingCreate') &&
            getAnnotationMode(state) === Mode.DRAWING &&
            creatorStatus !== CreatorStatus.pending,
        stashedPathGroups: getStashedDrawnPathGroupsForLocation(state, location),
    };
};

export const mapDispatchToProps = {
    addDrawingPathGroup: addDrawingPathGroupAction,
    redoDrawingPathGroup: redoDrawingPathGroupAction,
    resetDrawing: resetDrawingAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setReferenceId: setReferenceIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
    setupDrawing: setupDrawingAction,
    undoDrawingPathGroup: undoDrawingPathGroupAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
