import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { FormattedMessage } from 'react-intl';
import ItemList from '../../ItemList/ItemList';
import messages from '../messages';
import PopupBase from '../PopupBase';
import { Options, PopupReference } from '../Popper';
import './PopupList.scss';

export type Props<T extends { id: string }> = {
    activeItemIndex?: number;
    itemRowAs?: JSX.Element;
    items: T[];
    onActivate?: (index: number) => void;
    onSelect: (index: number, event: React.SyntheticEvent) => void;
    options?: Partial<Options>;
    reference: PopupReference;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 3],
            },
        },
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
    ],
    placement: 'bottom-start',
};

const PopupList = <T extends { id: string }>({ items, reference, ...rest }: Props<T>): JSX.Element => (
    <PopupBase className="ba-PopupList" options={options} reference={reference}>
        {isEmpty(items) ? (
            <div className="ba-PopupList-prompt">
                <FormattedMessage {...messages.popupListPrompt} />
            </div>
        ) : (
            <ItemList items={items} {...rest} />
        )}
    </PopupBase>
);

export default PopupList;
