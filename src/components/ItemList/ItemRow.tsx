import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classNames from 'classnames';
import { Collaborator } from '../../@types';
import { getFileId, getIsCurrentFileVersion } from '../../store';
import './ItemRow.scss';

export type Props = {
    className?: string;
    isActive?: boolean;
    item: Collaborator;
    onClick?: (event: React.SyntheticEvent) => void;
    onMouseDown?: (event: React.SyntheticEvent) => void;
    onMouseEnter?: (event: React.SyntheticEvent) => void;
};

export type ItemRowRef = HTMLLIElement;

const ItemRow = (props: Props, ref: React.Ref<ItemRowRef>): JSX.Element | null => {
    const { className, isActive, item: collaborator, onClick, onMouseDown, onMouseEnter } = props;
    const fileId = ReactRedux.useSelector(getFileId);
    const isCurrentFileVersion = ReactRedux.useSelector(getIsCurrentFileVersion);

    if (!collaborator || !collaborator.item || !collaborator.item.name) {
        return null;
    }

    const { item } = collaborator; // Nested item has id, name, and email (if a user type)

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <li
            ref={ref}
            aria-selected={isActive}
            className={classNames(className, 'ba-ItemRow', { 'is-active': isActive })}
            data-resin-fileid={fileId}
            data-resin-iscurrent={isCurrentFileVersion}
            data-resin-target="atMention"
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

export default React.forwardRef(ItemRow);
