import { Features } from '../../BoxAnnotations';
import { Permissions } from '../../@types';

export type OptionsState = {
    features: Features;
    fileId: string | null;
    fileVersionId: string | null;
    isCurrentFileVersion: boolean;
    permissions: Permissions;
    rotation: number;
    scale: number;
};
