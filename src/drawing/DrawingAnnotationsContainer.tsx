import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import { addStagedPathGroupAction } from '../store/drawing';
import { AnnotationDrawing } from '../@types';
import {
    AppState,
    CreatorItemDrawing,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getIsCurrentFileVersion,
    isCreatorStagedDrawing,
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
    isCreating: boolean;
    isCurrentFileVersion: boolean;
    staged: CreatorItemDrawing | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isDrawing),
        isCreating: isFeatureEnabled(state, 'drawingCreate') && getAnnotationMode(state) === Mode.DRAWING,
        isCurrentFileVersion: getIsCurrentFileVersion(state),
        staged: isCreatorStagedDrawing(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    addStagedPathGroup: addStagedPathGroupAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
