import { Features } from '../../BoxAnnotations';
import { Permissions } from '../../@types';

/** View mode: annotations and bounding boxes are mutually exclusive. */
export type ViewMode = 'annotations' | 'boundingBoxes';

export type OptionsState = {
    features: Features;
    fileId: string | null;
    fileVersionId: string | null;
    isCurrentFileVersion: boolean;
    permissions: Permissions;
    rotation: number;
    scale: number;
    viewMode: ViewMode;
};
