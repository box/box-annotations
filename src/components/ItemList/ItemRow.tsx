import React from 'react';
import classNames from 'classnames';
import { Collaborator } from '../../@types';
import './ItemRow.scss';

export type Props = {
    className?: string;
    isActive?: boolean;
    item: Collaborator;
    onClick?: (event: React.SyntheticEvent) => void;
    onMouseDown?: (event: React.SyntheticEvent) => void;
    onMouseEnter?: (event: React.SyntheticEvent) => void;
};

const ItemRow = ({
    className,
    isActive,
    item: collaborator,
    onClick,
    onMouseDown,
    onMouseEnter,
}: Props): JSX.Element | null => {
    if (!collaborator || !collaborator.item || !collaborator.item.name) {
        return null;
    }

    const { item } = collaborator; // Nested item has id, name, and email (if a user type)

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <li
            aria-selected={isActive}
            className={classNames(className, 'ba-ItemRow', { 'is-active': isActive })}
            data-testid="ba-ItemRow"
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            role="option"
        >
            <div className="ba-ItemRow-name" data-testid="ba-ItemRow-name">
                {item.name}
            </div>

            {item.type === 'user' && item.email && (
                <div className="ba-ItemRow-email" data-testid="ba-ItemRow-email">
                    {item.email}
                </div>
            )}
        </li>
    );
};

export default ItemRow;
