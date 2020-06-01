export enum PERMISSIONS {
    CAN_CREATE_ANNOTATIONS = 'can_create_annotations',
    CAN_VIEW_ANNOTATIONS = 'can_view_annotations',
}

export interface Permissions {
    [index: string]: boolean | undefined;
    [PERMISSIONS.CAN_CREATE_ANNOTATIONS]?: boolean;
    [PERMISSIONS.CAN_VIEW_ANNOTATIONS]?: boolean;
}

export type TokenLiteral = null | undefined | string | { read: string; write?: string };
export type TokenResolver = () => TokenLiteral | Promise<TokenLiteral>;
export type Token = TokenLiteral | TokenResolver;
