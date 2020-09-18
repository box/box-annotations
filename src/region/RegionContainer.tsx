import { connect } from 'react-redux';
import { AnnotationRegion } from '../@types';
import {
    AppState,
    CreatorItemRegion,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorMessage,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getRotation,
    isCreatorStagedRegion,
    isFeatureEnabled,
    Mode,
    resetCreatorAction,
    setActiveAnnotationIdAction,
    setMessageAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';
import { createRegionAction } from './actions';
import { isRegion } from './regionUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    message: string;
    staged: CreatorItemRegion | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isRegion),
        isCreating: getAnnotationMode(state) === Mode.REGION,
        isDiscoverabilityEnabled: isFeatureEnabled(state, 'discoverability'),
        isRotated: !!getRotation(state),
        message: getCreatorMessage(state),
        staged: isCreatorStagedRegion(staged) ? staged : null,
        status: getCreatorStatus(state),
    };
};

export const mapDispatchToProps = {
    createRegion: createRegionAction,
    resetCreator: resetCreatorAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setMessage: setMessageAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionAnnotations));
