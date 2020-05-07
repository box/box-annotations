import { AppState } from '../types';
import { Collaborator } from '../../@types';

type State = Pick<AppState, 'users'>;

// eslint-disable-next-line import/prefer-default-export
export const getCollaborators = (state: State): Collaborator[] | null => state.users.collaborators;
