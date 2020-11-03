import { connect } from 'react-redux';
import {
    AppState,
    CreatorItemRegion,
    getAnnotationMode,
    getCreatorStagedForLocation,
    getRotation,
    isCreatorStagedRegion,
    isFeatureEnabled,
    isImageFtuxCursorDisabled,
    isDocumentFtuxCursorDisabled,
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
    isDiscoverabilityEnabled: boolean;
    isFtuxCursorDisabled: boolean;
    isRotated: boolean;
    staged: CreatorItemRegion | null;
};

export const mapStateToProps = (
    state: AppState,
    { fileType, location }: { fileType: string; location: number },
): Props => {
    const staged = getCreatorStagedForLocation(state, location);

    const isFtuxCursorDisabled =
        fileType === 'document' ? isDocumentFtuxCursorDisabled(state) : isImageFtuxCursorDisabled(state);

    return {
        isCreating: getAnnotationMode(state) === Mode.REGION,
        isDiscoverabilityEnabled: isFeatureEnabled(state, 'discoverability'),
        isFtuxCursorDisabled,
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
