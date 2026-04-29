import type { DocumentNodeV2, MentionNodeV2, ParagraphNodeV2, TextMessageTypeV2, TextNodeV2 } from '@box/threaded-annotations';

import type { Annotation, Collaborator, Reply, UserMini } from '../@types';

const MENTION_REGEX = /@\[(\d+):([^\]]+)\]/g;

/**
 * Parses a plain-text line into paragraph content nodes.
 * Recognizes @[userId:userName] mention markup and converts to MentionNode / TextNode.
 */
const parseLine = (line: string): (MentionNodeV2 | TextNodeV2)[] => {
    const nodes: (MentionNodeV2 | TextNodeV2)[] = [];
    let lastIndex = 0;

    // Reset regex state since it's global
    MENTION_REGEX.lastIndex = 0;

    let match = MENTION_REGEX.exec(line);
    while (match !== null) {
        const [fullMatch, userId, userName] = match;
        const { index } = match;

        if (index > lastIndex) {
            nodes.push({ type: 'text', text: line.slice(lastIndex, index) });
        }

        nodes.push({
            type: 'mention',
            attrs: {
                authorId: '',
                mentionId: userId,
                mentionedUserId: userId,
                mentionedUserName: userName,
            },
        });

        lastIndex = index + fullMatch.length;
        match = MENTION_REGEX.exec(line);
    }

    if (lastIndex < line.length) {
        nodes.push({ type: 'text', text: line.slice(lastIndex) });
    }

    return nodes;
};

/**
 * Deserializes plain text with @[userId:userName] mention markup into a TipTap DocumentNode.
 * This is the reverse of serializeMentionMarkup from @box/threaded-annotations.
 *
 * Newlines are treated as paragraph breaks.
 */
export const deserializeMentionMarkup = (text: string): DocumentNodeV2 => {
    if (!text) {
        return { type: 'doc', content: [] };
    }

    const lines = text.split('\n');
    const content: ParagraphNodeV2[] = lines.map(line => {
        const nodes = parseLine(line);

        return {
            type: 'paragraph',
            ...(nodes.length > 0 ? { content: nodes } : {}),
        };
    });

    return { type: 'doc', content };
};

/**
 * Converts a box-annotations Reply to a threaded-annotations TextMessageType.
 */
export const replyToTextMessage = (reply: Reply): TextMessageTypeV2 => ({
    author: {
        email: reply.created_by.login ?? '',
        id: parseInt(reply.created_by.id, 10),
        name: reply.created_by.name,
    },
    createdAt: new Date(reply.created_at).getTime(),
    id: reply.id,
    message: deserializeMentionMarkup(reply.message),
    permissions: {
        canDelete: false,
        canEdit: false,
        canReply: true,
        canResolve: false,
    },
});

/**
 * Converts an Annotation's description (root message) to a TextMessageType.
 * The root message gets resolve permission from the annotation's permissions.
 */
const descriptionToTextMessage = (
    annotation: Annotation,
    reply: Reply,
): TextMessageTypeV2 => ({
    author: {
        email: reply.created_by.login ?? '',
        id: parseInt(reply.created_by.id, 10),
        name: reply.created_by.name,
    },
    createdAt: new Date(reply.created_at).getTime(),
    id: reply.id,
    message: deserializeMentionMarkup(reply.message),
    permissions: {
        canDelete: annotation.permissions?.can_delete ?? false,
        canEdit: annotation.permissions?.can_edit ?? false,
        canReply: true,
        canResolve: annotation.permissions?.can_resolve ?? false,
    },
});

/**
 * Maps a full Annotation (description + replies) to an array of TextMessageType
 * suitable for ThreadedAnnotationsV2.
 */
export const annotationToMessages = (annotation: Annotation): TextMessageTypeV2[] => {
    const messages: TextMessageTypeV2[] = [];

    if (annotation.description) {
        messages.push(descriptionToTextMessage(annotation, annotation.description));
    }

    if (annotation.replies) {
        annotation.replies.forEach(reply => {
            messages.push(replyToTextMessage(reply));
        });
    }

    return messages;
};

/**
 * Converts a box-annotations Collaborator to a @box/user-selector UserContactType.
 */
export const collaboratorToUserContact = (collaborator: Collaborator): {
    email: string;
    id: number;
    name: string;
    value: string;
} => {
    const item = collaborator.item as UserMini | undefined;

    return {
        email: item?.email ?? item?.login ?? '',
        id: parseInt(item?.id ?? collaborator.id, 10),
        name: item?.name ?? collaborator.name,
        value: collaborator.id,
    };
};
