import { connect } from 'react-redux';
import { AnnotationRegion } from '../@types';
import {
    AppState,
    CreatorItem,
    CreatorStatus,
    getActiveAnnotationId,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getCreatorStatus,
    setActiveAnnotationIdAction,
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
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: AppState, { page }: { page: number }): Props => ({
    activeAnnotationId: getActiveAnnotationId(state),
    annotations: getAnnotationsForLocation(state, page).filter(isRegion),
    isCreating: getAnnotationMode(state) === 'region',
    staged: getCreatorStagedForLocation(state, page),
    status: getCreatorStatus(state),
});

export const mapDispatchToProps = {
    createRegion: createRegionAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionAnnotations));
