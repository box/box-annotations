import { connect } from 'react-redux';
import { AppState, getCreatorCursor, setCursorAction } from '../../../store';
import ReplyField from './ReplyField';

export type Props = {
    cursorPosition: number;
};

export const mapStateToProps = (state: AppState): Props => ({
    cursorPosition: getCreatorCursor(state),
});

export const mapDispatchToProps = {
    setCursorPosition: setCursorAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyField);
