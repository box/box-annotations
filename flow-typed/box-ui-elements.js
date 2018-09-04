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
