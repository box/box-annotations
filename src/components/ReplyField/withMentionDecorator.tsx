import { CompositeDecorator, ContentBlock, ContentState, EditorState } from 'draft-js';
import MentionItem from './MentionItem';

export const mentionStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState,
): void => {
    contentBlock.findEntityRanges((character: { getEntity: () => string }) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'MENTION';
    }, callback);
};

export default function withMentionDecorator(editorState: EditorState): EditorState {
    const mentionDecorator = new CompositeDecorator([
        {
            strategy: mentionStrategy,
            component: MentionItem,
        },
    ]);

    return EditorState.set(editorState, { decorator: mentionDecorator });
}
