import { AppState } from '../types';
import { Collaborator } from '../../@types';

type State = Pick<AppState, 'users'>;

export const getCollaborators = (state: State): Collaborator[] => state.users.collaborators;
