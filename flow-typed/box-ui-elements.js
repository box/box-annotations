/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
import type { MessageDescriptor, InjectIntlProvidedProps } from 'react-intl';

type SelectorItem = {
    id: string,
    name: string,
    item: Object,
    value?: any
};

type SelectorItems = Array<SelectorItem>;

type ActionItemError = {
    title: MessageDescriptor,
    message: MessageDescriptor,
    action?: {
        text: MessageDescriptor,
        onAction: Function
    }
};

type BoxItemPermission = {
    can_comment?: boolean,
    can_edit_comment?: boolean,
    can_delete_comment?: boolean,
    can_preview?: boolean,
    can_rename?: boolean,
    can_download?: boolean,
    can_delete?: boolean,
    can_upload?: boolean,
    can_share?: boolean,
    can_set_share_access?: boolean
};

type Translations = {
    translationEnabled?: boolean,
    onTranslate?: Function
};