import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import { addDrawingPathGroupAction, getDrawingDrawnPathGroupsForLocation, resetDrawingAction } from '../store/drawing';
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
    };
};

export const mapDispatchToProps = {
    addDrawingPathGroup: addDrawingPathGroupAction,
    resetDrawing: resetDrawingAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setReferenceId: setReferenceIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
    setupDrawing: setupDrawingAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
