import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import {
    addDrawingPathGroupAction,
    getDrawingDrawnPathGroupsForLocation,
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
    setStagedAction,
    setStatusAction,
} from '../store';
import { isDrawing } from './drawingUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isDrawing),
        drawnPathGroups: getDrawingDrawnPathGroupsForLocation(state, location),
        isCreating:
            isFeatureEnabled(state, 'drawingCreate') &&
            getAnnotationMode(state) === Mode.DRAWING &&
            getCreatorStatus(state) !== CreatorStatus.pending,
    };
};

export const mapDispatchToProps = {
    addDrawingPathGroup: addDrawingPathGroupAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setDrawingLocation: setDrawingLocationAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
