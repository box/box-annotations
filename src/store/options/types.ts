import { Permissions } from '../../@types';

export type OptionsState = {
    fileId: string | null;
    fileVersionId: string | null;
    isCurrentFileVersion: boolean;
    permissions: Permissions;
    rotation: number;
    scale: number;
};
