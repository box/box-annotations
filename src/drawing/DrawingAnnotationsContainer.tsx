import { connect } from 'react-redux';
import DrawingAnnotations from './DrawingAnnotations';
import withProviders from '../common/withProviders';
import { AnnotationDrawing } from '../@types';
import {
    AppState,
    getActiveAnnotationId,
    getAnnotationsForLocation,
    getIsCurrentFileVersion,
    setActiveAnnotationIdAction,
} from '../store';
import { isDrawing } from './drawingUtil';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    isCurrentFileVersion: boolean;
};

export const mapStateToProps = (state: AppState, { location }: { location: number }): Props => {
    return {
        activeAnnotationId: getActiveAnnotationId(state),
        annotations: getAnnotationsForLocation(state, location).filter(isDrawing),
        isCurrentFileVersion: getIsCurrentFileVersion(state),
    };
};

export const mapDispatchToProps = {
    setActiveAnnotationId: setActiveAnnotationIdAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(DrawingAnnotations));
