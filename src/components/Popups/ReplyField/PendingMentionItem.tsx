import * as React from 'react';
import { bdlBoxBlue } from 'box-ui-elements/es/styles/variables';
import { CompositeDecorator, ContentBlock, ContentState } from 'draft-js';

type Props = {
    children: React.ReactNode;
    contentState: ContentState;
    decoratedText: string;
    entityKey?: string;
};

const PendingMentionItem = ({ children }: Props): JSX.Element => {
    return (
        <span id="pending-mention" style={{ color: bdlBoxBlue }}>
            {children}
        </span>
    );
};

export const mentionStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState,
): void => {
    contentBlock.findEntityRanges((character: { getEntity: () => string }) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'PENDING_MENTION';
    }, callback);
};

export const mentionDecorator = new CompositeDecorator([
    {
        strategy: mentionStrategy,
        component: PendingMentionItem,
    },
]);

export default PendingMentionItem;
