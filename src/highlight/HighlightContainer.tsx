import { connect } from 'react-redux';
import { AppState, getAnnotationMode } from '../store';
import HighlightAnnotations from './HighlightAnnotations';
import withProviders from '../common/withProviders';

export type Props = {
    isCreating: boolean;
};

export const mapStateToProps = (state: AppState): Props => ({
    isCreating: getAnnotationMode(state) === 'highlight',
});

export default connect(mapStateToProps)(withProviders(HighlightAnnotations));
