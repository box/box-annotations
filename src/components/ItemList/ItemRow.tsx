import React from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { UserMini, GroupMini } from '../../@types';
import './ItemRow.scss';

export type Props = {
    className?: string;
    isActive?: boolean;
    item?: UserMini | GroupMini;
};

const ItemRow = ({ className, isActive, item, ...rest }: Props): JSX.Element | null => {
    if (!item || !item.name) {
        return null;
    }

    const itemProps = omit(rest, Object.keys(item));

    return (
        <li
            aria-selected={isActive ? 'true' : 'false'}
            className={classNames(className, 'ba-ItemRow', { 'is-active': isActive })}
            data-testid="ba-ItemRow"
            role="option"
            {...itemProps}
        >
            <div className="ba-ItemRow-name" data-testid="ba-ItemRow-name">
                {item.name}
            </div>
            {'email' in item && (
                <div className="ba-ItemRow-email" data-testid="ba-ItemRow-email">
                    {item.email}
                </div>
            )}
        </li>
    );
};

export default ItemRow;
