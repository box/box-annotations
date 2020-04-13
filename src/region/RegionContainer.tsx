import { connect } from 'react-redux';
import { Annotation } from '../@types';
import {
    ApplicationState,
    CreatorItem,
    CreatorStatus,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getCreatorStatus,
    setStagedAction,
    setStatusAction,
} from '../store';
import { createRegionAction } from './actions';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';

export type Props = {
    annotations: Annotation[];
    isCreating: boolean;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export const mapStateToProps = (state: ApplicationState, { page }: { page: number }): Props => ({
    annotations: getAnnotationsForLocation(state, page),
    isCreating: getAnnotationMode(state) === 'region',
    staged: getCreatorStagedForLocation(state, page),
    status: getCreatorStatus(state),
});

export const mapDispatchTopProps = {
    createRegion: createRegionAction,
    setStaged: setStagedAction,
    setStatus: setStatusAction,
};

export default connect(mapStateToProps, mapDispatchTopProps)(withProviders(RegionAnnotations));
