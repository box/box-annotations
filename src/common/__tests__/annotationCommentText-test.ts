import { annotationCommentDescriptionId, toAccessibleCommentText } from '../annotationCommentText';

describe('annotationCommentText', () => {
    describe('toAccessibleCommentText()', () => {
        test('returns an empty string when there is no message', () => {
            expect(toAccessibleCommentText(undefined)).toBe('');
            expect(toAccessibleCommentText('')).toBe('');
            expect(toAccessibleCommentText('   ')).toBe('');
        });

        test('replaces mention markup with the display name', () => {
            expect(toAccessibleCommentText('Hello @[123:Jane Doe], see this')).toBe('Hello Jane Doe, see this');
        });

        test('collapses whitespace', () => {
            expect(toAccessibleCommentText('line one\n\nline two')).toBe('line one line two');
        });
    });

    describe('annotationCommentDescriptionId()', () => {
        test('builds a stable id from the annotation id', () => {
            expect(annotationCommentDescriptionId('anno_1')).toBe('ba-annotation-comment-anno_1');
        });
    });
});
