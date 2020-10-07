import { connect } from 'react-redux';
import {
    AppState,
    CreatorItemRegion,
    getAnnotationMode,
    getCreatorStagedForLocation,
    getRotation,
    isCreatorStagedRegion,
    isFeatureEnabled,
    Mode,
    resetCreatorAction,
    setReferenceShapeAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import RegionCreation from './RegionCreation';
import withProviders from '../common/withProviders';

export type Props = {
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    staged: CreatorItemRegion | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        isCreating: getAnnotationMode(state) === Mode.REGION,
        isDiscoverabilityEnabled: isFeatureEnabled(state, 'discoverability'),
        isRotated: !!getRotation(state),
        staged: isCreatorStagedRegion(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    resetCreator: resetCreatorAction,
    setReferenceShape: setReferenceShapeAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionCreation));
