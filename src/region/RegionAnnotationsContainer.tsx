import { connect } from 'react-redux';
import { AnnotationRegion } from '../@types';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';
import { AppState, getActiveAnnotationId, getAnnotationsForLocation, setActiveAnnotationIdAction } from '../store';
import { isRegion } from './regionUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isRegion),
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(RegionAnnotations));
