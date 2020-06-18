import { connect } from 'react-redux';
import { AppState, fetchCollaboratorsAction, getCollaborators, getCreatorCursor, setCursorAction } from '../../store';
import ReplyField from './ReplyField';
import { Collaborator } from '../../@types';

export type Props = {
    collaborators: Collaborator[];
    cursorPosition: number;
};

export const mapStateToProps = (state: AppState): Props => ({
    collaborators: getCollaborators(state),
    cursorPosition: getCreatorCursor(state),
});

export const mapDispatchToProps = {
    fetchCollaborators: fetchCollaboratorsAction,
    setCursorPosition: setCursorAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyField);
