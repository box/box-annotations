import React from 'react';
import DatalistItem from 'box-ui-elements/es/components/datalist-item';
import { UserMini, GroupMini } from '../../@types';
import './ItemRow.scss';

export type Props = {
    id?: string;
    item?: UserMini | GroupMini;
    name?: string;
};

const ItemRow = ({ item, ...rest }: Props): JSX.Element | null => {
    if (!item || !item.name) {
        return null;
    }

    return (
        <DatalistItem {...rest}>
            <div className="ba-ItemRow-name" data-testid="ba-ItemRow-name">
                {item.name}
            </div>
            {'email' in item && (
                <div className="ba-ItemRow-email" data-testid="ba-ItemRow-email">
                    {item.email}
                </div>
            )}
        </DatalistItem>
    );
};

export default ItemRow;
