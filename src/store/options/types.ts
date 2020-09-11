import { Permissions } from '../../@types';

export type OptionsState = {
    fileId: string | null;
    fileVersionId: string | null;
    isCurrentFileVersion: boolean;
    isDiscoverabilityFeatureEnabled: boolean;
    permissions: Permissions;
    rotation: number;
    scale: number;
};
