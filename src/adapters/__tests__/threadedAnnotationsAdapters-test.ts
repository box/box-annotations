import {
    annotationToMessages,
    collaboratorToUserContact,
    deserializeMentionMarkup,
    replyToTextMessage,
} from '../threadedAnnotationsAdapters';
import type { Annotation, Collaborator, Reply } from '../../@types';
import { TARGET_TYPE } from '../../constants';

describe('threadedAnnotationsAdapters', () => {
    describe('deserializeMentionMarkup', () => {
        test('should return empty doc for empty string', () => {
            const result = deserializeMentionMarkup('');
            expect(result).toEqual({ type: 'doc', content: [] });
        });

        test('should parse plain text into a single paragraph', () => {
            const result = deserializeMentionMarkup('Hello world');
            expect(result).toEqual({
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Hello world' }],
                    },
                ],
            });
        });

        test('should parse mention markup into mention nodes', () => {
            const result = deserializeMentionMarkup('Hello @[123:John Doe] how are you?');
            expect(result).toEqual({
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            { type: 'text', text: 'Hello ' },
                            {
                                type: 'mention',
                                attrs: {
                                    authorId: '',
                                    mentionId: '123',
                                    mentionedUserId: '123',
                                    mentionedUserName: 'John Doe',
                                },
                            },
                            { type: 'text', text: ' how are you?' },
                        ],
                    },
                ],
            });
        });

        test('should handle multiple mentions in the same line', () => {
            const result = deserializeMentionMarkup('@[1:Alice] and @[2:Bob]');
            expect(result.content[0].content).toHaveLength(3);
            expect(result.content[0].content?.[0]).toEqual({
                type: 'mention',
                attrs: { authorId: '', mentionId: '1', mentionedUserId: '1', mentionedUserName: 'Alice' },
            });
            expect(result.content[0].content?.[1]).toEqual({ type: 'text', text: ' and ' });
            expect(result.content[0].content?.[2]).toEqual({
                type: 'mention',
                attrs: { authorId: '', mentionId: '2', mentionedUserId: '2', mentionedUserName: 'Bob' },
            });
        });

        test('should split newlines into separate paragraphs', () => {
            const result = deserializeMentionMarkup('Line 1\nLine 2\nLine 3');
            expect(result.content).toHaveLength(3);
            expect(result.content[0].content?.[0]).toEqual({ type: 'text', text: 'Line 1' });
            expect(result.content[1].content?.[0]).toEqual({ type: 'text', text: 'Line 2' });
            expect(result.content[2].content?.[0]).toEqual({ type: 'text', text: 'Line 3' });
        });

        test('should create empty paragraph for blank line', () => {
            const result = deserializeMentionMarkup('Before\n\nAfter');
            expect(result.content).toHaveLength(3);
            expect(result.content[1]).toEqual({ type: 'paragraph' });
        });

        test('should handle mention at start of text', () => {
            const result = deserializeMentionMarkup('@[99:Jane] please review');
            expect(result.content[0].content?.[0]).toEqual({
                type: 'mention',
                attrs: { authorId: '', mentionId: '99', mentionedUserId: '99', mentionedUserName: 'Jane' },
            });
            expect(result.content[0].content?.[1]).toEqual({ type: 'text', text: ' please review' });
        });

        test('should handle mention at end of text', () => {
            const result = deserializeMentionMarkup('cc @[50:Sam]');
            expect(result.content[0].content?.[0]).toEqual({ type: 'text', text: 'cc ' });
            expect(result.content[0].content?.[1]).toEqual({
                type: 'mention',
                attrs: { authorId: '', mentionId: '50', mentionedUserId: '50', mentionedUserName: 'Sam' },
            });
        });
    });

    describe('replyToTextMessage', () => {
        const mockReply: Reply = {
            created_at: '2026-03-15T10:30:00Z',
            created_by: { id: '42', login: 'jdoe@box.com', name: 'Jane Doe', type: 'user' },
            id: 'reply-1',
            message: 'This is a reply',
            parent: { id: 'annotation-1', type: 'annotation' },
            type: 'reply',
        };

        test('should map reply fields to TextMessageType', () => {
            const result = replyToTextMessage(mockReply);

            expect(result.id).toBe('reply-1');
            expect(result.author.id).toBe(42);
            expect(result.author.name).toBe('Jane Doe');
            expect(result.author.email).toBe('jdoe@box.com');
            expect(result.createdAt).toBe(new Date('2026-03-15T10:30:00Z').getTime());
        });

        test('should deserialize mention markup in message', () => {
            const reply: Reply = {
                ...mockReply,
                message: 'Hey @[10:Alice] check this',
            };
            const result = replyToTextMessage(reply);

            expect(result.message.content[0].content).toHaveLength(3);
            expect(result.message.content[0].content?.[1]).toMatchObject({
                type: 'mention',
                attrs: { mentionedUserId: '10', mentionedUserName: 'Alice' },
            });
        });

        test('should set default permissions for replies', () => {
            const result = replyToTextMessage(mockReply);

            expect(result.permissions).toEqual({
                canDelete: false,
                canEdit: false,
                canReply: true,
                canResolve: false,
            });
        });
    });

    describe('annotationToMessages', () => {
        const baseAnnotation: Annotation = {
            created_at: '2026-01-01T00:00:00Z',
            created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
            id: 'ann-1',
            modified_at: '2026-01-01T00:00:00Z',
            modified_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
            permissions: { can_delete: true, can_edit: true },
            target: { type: 'point', location: { type: TARGET_TYPE.PAGE, value: 1 }, x: 0, y: 0 },
            type: 'annotation',
        };

        test('should return empty array when no description or replies', () => {
            const result = annotationToMessages(baseAnnotation);
            expect(result).toEqual([]);
        });

        test('should include description as first message', () => {
            const annotation: Annotation = {
                ...baseAnnotation,
                description: {
                    created_at: '2026-01-01T00:00:00Z',
                    created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
                    id: 'desc-1',
                    message: 'Root message',
                    parent: { id: 'ann-1', type: 'annotation' },
                    type: 'reply',
                },
            };
            const result = annotationToMessages(annotation);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('desc-1');
            expect(result[0].permissions.canDelete).toBe(true);
            expect(result[0].permissions.canEdit).toBe(true);
        });

        test('should include description and replies in order', () => {
            const annotation: Annotation = {
                ...baseAnnotation,
                description: {
                    created_at: '2026-01-01T00:00:00Z',
                    created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
                    id: 'desc-1',
                    message: 'Root',
                    parent: { id: 'ann-1', type: 'annotation' },
                    type: 'reply',
                },
                replies: [
                    {
                        created_at: '2026-01-02T00:00:00Z',
                        created_by: { id: '2', login: 'other@box.com', name: 'Other', type: 'user' },
                        id: 'reply-1',
                        message: 'First reply',
                        parent: { id: 'ann-1', type: 'annotation' },
                        type: 'reply',
                    },
                ],
            };
            const result = annotationToMessages(annotation);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('desc-1');
            expect(result[1].id).toBe('reply-1');
        });
    });

    describe('collaboratorToUserContact', () => {
        test('should map collaborator with user item', () => {
            const collaborator: Collaborator = {
                id: 'collab-1',
                item: {
                    avatar_url: 'https://example.com/avatar.png',
                    email: 'jane@box.com',
                    id: '42',
                    login: 'jane@box.com',
                    name: 'Jane Doe',
                    type: 'user',
                },
                name: 'Jane Doe',
            };
            const result = collaboratorToUserContact(collaborator);

            expect(result.email).toBe('jane@box.com');
            expect(result.id).toBe(42);
            expect(result.name).toBe('Jane Doe');
            expect(result.value).toBe('collab-1');
        });

        test('should fall back to login when email is missing', () => {
            const collaborator: Collaborator = {
                id: 'collab-2',
                item: {
                    id: '10',
                    login: 'bob@box.com',
                    name: 'Bob',
                    type: 'user',
                },
                name: 'Bob',
            };
            const result = collaboratorToUserContact(collaborator);

            expect(result.email).toBe('bob@box.com');
        });

        test('should fall back to collaborator name when item is missing', () => {
            const collaborator: Collaborator = {
                id: 'collab-3',
                name: 'Group Name',
            };
            const result = collaboratorToUserContact(collaborator);

            expect(result.name).toBe('Group Name');
            expect(result.email).toBe('');
            expect(result.id).toBeNaN();
        });
    });
});
