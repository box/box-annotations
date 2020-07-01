import { connect } from 'react-redux';
import { AnnotationRegion } from '../@types';
import {
    AppState,
    CreatorItem,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorMessage,
    getCreatorStagedForLocation,
    getCreatorStatus,
    setActiveAnnotationIdAction,
    setMessageAction,
    setStagedAction,
    setStatusAction,
    getRotation,
} from '../store';
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
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => ({
    activeAnnotationId: getActiveAnnotationId(state),
    annotations: getAnnotationsForLocation(state, location).filter(isRegion),
    isCreating: getAnnotationMode(state) === 'region',
    isRotated: !!getRotation(state),
    message: getCreatorMessage(state),
    staged: getCreatorStagedForLocation(state, location),
    status: getCreatorStatus(state),
});

export const mapDispatchToProps = {
    createRegion: createRegionAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setMessage: setMessageAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionAnnotations));
