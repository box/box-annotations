export enum PERMISSIONS {
    CAN_ANNOTATE = 'can_annotate',
    CAN_CREATE_ANNOTATIONS = 'can_create_annotations',
    CAN_VIEW_ANNOTATIONS = 'can_view_annotations',
    CAN_VIEW_ANNOTATIONS_ALL = 'can_view_annotations_all',
    CAN_VIEW_ANNOTATIONS_SELF = 'can_view_annotations_self',
}

export interface Permissions {
    [index: string]: boolean | undefined;
    [PERMISSIONS.CAN_ANNOTATE]?: boolean;
    [PERMISSIONS.CAN_CREATE_ANNOTATIONS]?: boolean;
    [PERMISSIONS.CAN_VIEW_ANNOTATIONS]?: boolean;
    [PERMISSIONS.CAN_VIEW_ANNOTATIONS_ALL]?: boolean;
    [PERMISSIONS.CAN_VIEW_ANNOTATIONS_SELF]?: boolean;
}

export type TokenLiteral = null | undefined | string | { read: string; write?: string };
export type TokenResolver = () => TokenLiteral | Promise<TokenLiteral>;
export type Token = TokenLiteral | TokenResolver;
