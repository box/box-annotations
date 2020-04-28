import { connect } from 'react-redux';
import { AppState, getStagedCursor, setStagedCursorAction } from '../../../store';
import ReplyField from './ReplyField';

export type Props = {
    cursorPosition: number;
};

export const mapStateToProps = (state: AppState): Props => ({
    cursorPosition: getStagedCursor(state),
});

export const mapDispatchToProps = {
    setCursorPosition: setStagedCursorAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyField);
