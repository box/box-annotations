import getProp from 'lodash/get';
import { AppState } from '../types';
import { Permissions } from '../../@types';
import { Features } from '../../BoxAnnotations';

type State = Pick<AppState, 'options'>;

export const getFeatures = (state: State): Features => state.options.features;
export const getFileId = (state: State): string | null => state.options.fileId;
export const getFileVersionId = (state: State): string | null => state.options.fileVersionId;
export const getIsCurrentFileVersion = (state: State): boolean => state.options.isCurrentFileVersion;
export const getPermissions = (state: State): Permissions => state.options.permissions;
export const getRotation = (state: State): number => state.options.rotation;
export const getScale = (state: State): number => state.options.scale;
export const isFeatureEnabled = (state: State, featurename: string): boolean =>
    getProp(getFeatures(state), featurename, false);
