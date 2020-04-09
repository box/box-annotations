import { connect } from 'react-redux';
import { Annotation } from '../@types';
import {
    ApplicationState,
    CreatorItem,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStatus,
    getCreatorStagedForLocation,
    saveAnnotation,
    setStaged,
    setStatus,
    CreatorStatus,
} from '../store';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';

type Props = {
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
    saveAnnotation,
    setStaged,
    setStatus,
};

export default connect(mapStateToProps, mapDispatchTopProps)(withProviders(RegionAnnotations));
