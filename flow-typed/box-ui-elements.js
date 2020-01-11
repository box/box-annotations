/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
import type { MessageDescriptor } from 'react-intl';

type SelectorItem<T: any = any> = {
    id: string,
    item?: T, // ie UserMini or GroupMini
    name: string,
    value?: any,
};

type SelectorItems<T: any = any> = Array<SelectorItem<T>>;

type ActionItemError = {
    title: MessageDescriptor,
    message: MessageDescriptor,
    action?: {
        onAction: Function,
        text: MessageDescriptor,
    },
};

type BoxItemPermission = {
    can_comment?: boolean,
    can_delete_comment?: boolean,
    can_delete?: boolean,
    can_download?: boolean,
    can_edit_comment?: boolean,
    can_preview?: boolean,
    can_rename?: boolean,
    can_upload?: boolean,
    can_share?: boolean,
    can_set_share_access?: boolean,
};

type Translations = {
    onTranslate?: Function,
    translationEnabled?: boolean,
};
