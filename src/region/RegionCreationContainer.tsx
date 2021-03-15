import { connect } from 'react-redux';
import {
    AppState,
    CreatorItemRegion,
    CreatorStatus,
    getAnnotationMode,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getRotation,
    isCreatorStagedRegion,
    Mode,
    resetCreatorAction,
    setReferenceIdAction,
    setStagedAction,
    setStatusAction,
} from '../store';
import RegionCreation from './RegionCreation';
import withProviders from '../common/withProviders';

export type Props = {
    isCreating: boolean;
    isRotated: boolean;
    staged: CreatorItemRegion | null;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    return {
        isCreating: getAnnotationMode(state) === Mode.REGION && getCreatorStatus(state) !== CreatorStatus.pending,
        isRotated: !!getRotation(state),
        staged: isCreatorStagedRegion(staged) ? staged : null,
    };
};

export const mapDispatchToProps = {
    resetCreator: resetCreatorAction,
    setReferenceId: setReferenceIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionCreation));
