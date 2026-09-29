const MENTION_MARKUP = /@\[(\d+):([^\]]+)\]/g;

/**
 * Turns stored comment text into a string a screen reader can speak.
 * Mention markup (@[id:Name]) becomes the display name.
 */
export function toAccessibleCommentText(message: string | undefined): string {
    if (!message) {
        return '';
    }

    return message.replace(MENTION_MARKUP, '$2').replace(/\s+/g, ' ').trim();
}

export function annotationCommentDescriptionId(annotationId: string): string {
    return `ba-annotation-comment-${annotationId}`;
}
