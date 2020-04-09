import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import RegionAnnotations from './RegionAnnotations';
import withProviders from '../common/withProviders';

type Props = {
    isCreating: boolean;
};

export const mapStateToProps = (state: ApplicationState): Props => ({
    isCreating: state.common.mode === 'region',
});

export default connect(mapStateToProps)(withProviders(RegionAnnotations));
