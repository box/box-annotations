import * as React from 'react';
import { ContentState } from 'draft-js';
import './MentionItem.scss';

export type Props = {
    children: React.ReactNode;
    contentState: ContentState;
    entityKey: string;
};

const MentionItem = ({ contentState, entityKey, children }: Props): JSX.Element => {
    const { id } = contentState.getEntity(entityKey).getData();

    return id ? (
        <a className="ba-MentionItem-link" data-testid="ba-MentionItem-link" href={`/profile/${id}`}>
            {children}
        </a>
    ) : (
        <span className="ba-MentionItem-link" data-testid="ba-MentionItem-text">
            {children}
        </span>
    );
};

export default MentionItem;
