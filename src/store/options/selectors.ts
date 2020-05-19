import { AppState } from '../types';
import { Permissions } from '../../@types';

type State = Pick<AppState, 'options'>;

export const getFileId = (state: State): string | null => state.options.fileId;
export const getFileVersionId = (state: State): string | null => state.options.fileVersionId;
export const getPermissions = (state: State): Permissions => state.options.permissions;
