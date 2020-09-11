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
    Mode,
    resetCreatorAction,
    setActiveAnnotationIdAction,
    setMessageAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import { getIsDiscoverabilityFeatureEnabled } from '../store/options/selectors';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';
import { createRegionAction } from './actions';
import { isRegion } from './regionUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    isCreating: boolean;
    isRotated: boolean;
    message: string;
    staged: CreatorItemRegion | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);
    const isDiscoverabilityFeatureEnabled = getIsDiscoverabilityFeatureEnabled(state);

    const isCreating = isDiscoverabilityFeatureEnabled
        ? getAnnotationMode(state) === Mode.REGION || getAnnotationMode(state) === Mode.NONE
        : getAnnotationMode(state) === Mode.REGION;

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isRegion),
        isCreating,
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
