import React from 'react';
import noop from 'lodash/noop';
import scrollIntoView from 'scroll-into-view-if-needed';
import ItemRow, { ItemRowRef } from './ItemRow';
import './ItemList.scss';

export type Props<T extends { id: string }> = {
    activeItemIndex?: number;
    autoScroll?: boolean;
    itemRowAs?: React.ElementType;
    items: T[];
    onActivate?: (index: number) => void;
    onSelect: (index: number, event: React.SyntheticEvent) => void;
};

const ItemList = <T extends { id: string }>({
    activeItemIndex = 0,
    autoScroll = false,
    itemRowAs: ItemRowComponent = ItemRow,
    items,
    onActivate = noop,
    onSelect,
    ...rest
}: Props<T>): JSX.Element => {
    const activeRef = React.useCallback(
        (activeEl: ItemRowRef) => {
            if (!autoScroll || !activeEl) {
                return;
            }

            scrollIntoView(activeEl, {
                scrollMode: 'if-needed',
                block: 'nearest',
            });
        },
        [autoScroll],
    );

    return (
        <ul className="ba-ItemList" data-testid="ba-ItemList" role="listbox" {...rest}>
            {items.map((item, index) => (
                <ItemRowComponent
                    key={item.id}
                    ref={index === activeItemIndex ? activeRef : null}
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
};

export default ItemList;
