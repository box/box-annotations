import { AppState } from '../types';

type State = Pick<AppState, 'options'>;

export const getFileId = (state: State): string | null => state.options.fileId;
export const getFileVersionId = (state: State): string | null => state.options.fileVersionId;
