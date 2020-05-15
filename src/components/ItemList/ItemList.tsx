import React, { SyntheticEvent } from 'react';
import noop from 'lodash/noop';
import ItemRow from './ItemRow';
import './ItemList.scss';

export type Props<T extends { id: string }> = {
    activeItemIndex?: number;
    itemRowAs?: JSX.Element;
    items: T[];
    onActivate?: (index: number) => void;
    onSelect: (index: number, event: React.SyntheticEvent) => void;
};

const ItemList = <T extends { id: string }>({
    activeItemIndex = 0,
    itemRowAs = <ItemRow />,
    items,
    onActivate = noop,
    onSelect,
    ...rest
}: Props<T>): JSX.Element => (
    <ul data-testid="ba-ItemList" role="listbox" {...rest}>
        {items.map((item, index) =>
            React.cloneElement(itemRowAs, {
                ...item,
                key: item.id,
                className: 'ba-ItemList-row',
                isActive: index === activeItemIndex,
                onClick: (event: SyntheticEvent) => {
                    onSelect(index, event);
                },
                /* preventDefault on mousedown so blur doesn't happen before click */
                onMouseDown: (event: SyntheticEvent) => {
                    event.preventDefault();
                },
                onMouseEnter: () => {
                    onActivate(index);
                },
            }),
        )}
    </ul>
);

export default ItemList;
