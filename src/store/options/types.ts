import { Permissions } from '../../@types';

export type OptionsState = {
    fileId: string | null;
    fileVersionId: string | null;
    permissions: Permissions;
    rotation: number;
    scale: number;
};
