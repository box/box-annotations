import * as React from 'react';
import * as Popper from '@popperjs/core';
import * as ReactPopper from 'react-popper';
import isEmpty from 'lodash/isEmpty';
import { FormattedMessage } from 'react-intl';
import ItemList from '../ItemList';
import messages from './messages';
import PopupBase from './PopupBase';
import './PopupList.scss';

export type Props<T extends { id: string }> = {
    activeItemIndex?: number;
    items: T[];
    onActivate?: (index: number) => void;
    onSelect: (index: number, event: React.SyntheticEvent) => void;
    reference: Element | Popper.VirtualElement;
};

const options: Partial<Popper.Options> = {
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

const PopupList = <T extends { id: string }>({ items, reference, ...rest }: Props<T>): JSX.Element => {
    const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
    const { attributes, styles } = ReactPopper.usePopper(reference, popupElement, options);

    return (
        <PopupBase ref={setPopupElement} attributes={attributes} className="ba-PopupList" styles={styles}>
            {isEmpty(items) ? (
                <div className="ba-PopupList-prompt">
                    <FormattedMessage {...messages.popupListPrompt} />
                </div>
            ) : (
                <ItemList items={items} {...rest} />
            )}
        </PopupBase>
    );
};

export default PopupList;
