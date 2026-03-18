import { connect } from 'react-redux';
import { BoundingBoxHighlightList } from '../components/BoundingBoxHighlight';
import withProviders from '../common/withProviders';
import {
    AppState,
    getBoundingBoxHighlights,
    getBoundingBoxHighlightsForPage,
    getSelectedBoundingBoxHighlightId,
    navigateBoundingBoxHighlightAction,
    setSelectedBoundingBoxHighlightAction,
} from '../store';

export type Props = {
    location: number;
};

const mapStateToProps = (state: AppState, { location }: Props) => ({
    allBoundingBoxes: getBoundingBoxHighlights(state),
    boundingBoxes: getBoundingBoxHighlightsForPage(state, location),
    selectedId: getSelectedBoundingBoxHighlightId(state),
});

const mapDispatchToProps = {
    onNavigate: navigateBoundingBoxHighlightAction,
    onSelect: setSelectedBoundingBoxHighlightAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(withProviders(BoundingBoxHighlightList));
