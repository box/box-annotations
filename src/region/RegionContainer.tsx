import { connect } from 'react-redux';
import { Annotation, AnnotationRegion } from '../@types';
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
import { createRegionAction } from './actions';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    isCreating: boolean;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const isRegion = (annotation: Annotation): annotation is AnnotationRegion => annotation.target.type === 'region';

export const mapStateToProps = (state: AppState, { page }: { page: number }): Props => ({
    activeAnnotationId: getActiveAnnotationId(state),
    annotations: getAnnotationsForLocation(state, page).filter(isRegion),
    isCreating: getAnnotationMode(state) === 'region',
    staged: getCreatorStagedForLocation(state, page),
    status: getCreatorStatus(state),
});

export const mapDispatchTopProps = {
    createRegion: createRegionAction,
    setActiveAnnotationId: setActiveAnnotationIdAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchTopProps)(withProviders(RegionAnnotations));
