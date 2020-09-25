import { connect } from 'react-redux';
import { AnnotationRegion } from '../@types';
import {
    AppState,
    CreatorItemRegion,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getRotation,
    isCreatorStagedRegion,
    isFeatureEnabled,
    Mode,
    setActiveAnnotationIdAction,
    setReferenceShapeAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';
import { isRegion } from './regionUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    staged: CreatorItemRegion | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isRegion),
        isCreating: getAnnotationMode(state) === Mode.REGION,
        isDiscoverabilityEnabled: isFeatureEnabled(state, 'discoverability'),
        isRotated: !!getRotation(state),
        staged: isCreatorStagedRegion(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setReferenceShape: setReferenceShapeAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionAnnotations));
