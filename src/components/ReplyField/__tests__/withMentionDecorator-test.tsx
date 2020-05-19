import { EditorState, CompositeDecorator, ContentState } from 'draft-js';
import withMentionDecorator, { mentionStrategy } from '../withMentionDecorator';

describe('components/Popups/ReplyField/withMentionDecorator', () => {
    test('should set decorator', () => {
        const mockEditorState = EditorState.createEmpty();

        jest.spyOn(EditorState, 'set');

        const newEditorState = withMentionDecorator(mockEditorState);

        expect(EditorState.set).toBeCalledWith(mockEditorState, { decorator: expect.any(CompositeDecorator) });
        expect(newEditorState.getDecorator()).not.toBeNull();
    });

    test('should call findEntityRanges', () => {
        const mockContentState = ContentState.createFromText('test');
        const mockContentBlock = mockContentState.getFirstBlock();
        const mockCallback = jest.fn();

        jest.spyOn(mockContentBlock, 'findEntityRanges');

        mentionStrategy(mockContentBlock, mockCallback, mockContentState);

        expect(mockContentBlock.findEntityRanges).toBeCalledWith(expect.any(Function), mockCallback);
    });
});
