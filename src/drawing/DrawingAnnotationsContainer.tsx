import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import {
    addDrawingPathGroupAction,
    getDrawingDrawnPathGroupsForLocation,
    resetDrawingAction,
    setDrawingLocationAction,
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

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const creatorStatus = getCreatorStatus(state);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isDrawing),
        drawnPathGroups: getDrawingDrawnPathGroupsForLocation(state, location),
        isCreating:
            isFeatureEnabled(state, 'drawingCreate') &&
            getAnnotationMode(state) === Mode.DRAWING &&
            creatorStatus !== CreatorStatus.pending,
        status: creatorStatus,
    };
};

export const mapDispatchToProps = {
    addDrawingPathGroup: addDrawingPathGroupAction,
    resetDrawing: resetDrawingAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setDrawingLocation: setDrawingLocationAction,
    setReferenceId: setReferenceIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
