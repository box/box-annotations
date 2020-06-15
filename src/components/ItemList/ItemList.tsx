import React from 'react';
import noop from 'lodash/noop';
import ItemRow from './ItemRow';
import './ItemList.scss';

export type Props<T extends { id: string }> = {
    activeItemIndex?: number;
    itemRowAs?: React.ElementType;
    items: T[];
    onActivate?: (index: number) => void;
    onSelect: (index: number, event: React.SyntheticEvent) => void;
};

const ItemList = <T extends { id: string }>({
    activeItemIndex = 0,
    itemRowAs: ItemRowComponent = ItemRow,
    items,
    onActivate = noop,
    onSelect,
    ...rest
}: Props<T>): JSX.Element => (
    <ul className="ba-ItemList" data-testid="ba-ItemList" role="listbox" {...rest}>
        {items.map((item, index) => (
            <ItemRowComponent
                key={item.id}
                className="ba-ItemList-row"
                isActive={index === activeItemIndex}
                item={item}
                onClick={(event: React.SyntheticEvent) => {
                    onSelect(index, event);
                }}
                onMouseDown={(event: React.SyntheticEvent) => {
                    event.preventDefault(); // preventDefault on mousedown so blur doesn't happen before click
                }}
                onMouseEnter={() => {
                    onActivate(index);
                }}
            />
        ))}
    </ul>
);

export default ItemList;
