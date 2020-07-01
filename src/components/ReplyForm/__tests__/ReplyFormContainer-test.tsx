import { EditorState, ContentState } from 'draft-js';
import { mapStateToProps, mapPropsToValues, validate, handleSubmit } from '../ReplyFormContainer';
import { AppState } from '../../../store';

jest.mock('../../../store', () => ({
    getCreatorCursor: jest.fn().mockReturnValue(1),
    getFileId: jest.fn().mockReturnValue('0'),
    getIsCurrentFileVersion: jest.fn().mockReturnValue(true),
}));

describe('components/ReplyForm/ReplyFormContainer', () => {
    const defaults = {
        cursorPosition: 0,
        fileId: '0',
        isCurrentFileVersion: true,
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
    };

    describe('mapStateToProps()', () => {
        test('should set props', () => {
            expect(mapStateToProps({} as AppState)).toEqual({
                cursorPosition: 1,
                fileId: '0',
                isCurrentFileVersion: true,
            });
        });
    });

    describe('mapPropsToValues()', () => {
        test.each`
            value         | expectedCursorPosition | expectedText
            ${'asdfasdf'} | ${5}                   | ${'asdfasdf'}
            ${undefined}  | ${0}                   | ${''}
        `(
            'should apply cursor position appropriately based on value $value',
            ({ value, expectedCursorPosition, expectedText }) => {
                const { editorState } = mapPropsToValues({ ...defaults, cursorPosition: 5, value });
                expect(editorState.getCurrentContent().getPlainText()).toBe(expectedText);
                expect(editorState.getSelection().getAnchorOffset()).toBe(expectedCursorPosition);
                expect(editorState.getSelection().getFocusOffset()).toBe(expectedCursorPosition);
            },
        );
    });

    describe('validate()', () => {
        const maxlengthValue = `${'abcde'.repeat(2000)}a`;
        test.each`
            test                  | value             | expectedError
            ${'undefined'}        | ${undefined}      | ${'required'}
            ${'empty string'}     | ${' '}            | ${'required'}
            ${'max length value'} | ${maxlengthValue} | ${'maxlength'}
            ${'valid'}            | ${'abcde'}        | ${undefined}
        `('should return the expected error $expectedError given the value is $test', ({ value, expectedError }) => {
            const editorState = value
                ? EditorState.createWithContent(ContentState.createFromText(value))
                : EditorState.createEmpty();
            const errors = validate({ editorState });

            expect(errors.editorState).toBe(expectedError);
        });
    });

    describe('handleSubmit()', () => {
        test('should call provided onSubmit prop with extracted text', () => {
            const editorState = EditorState.createWithContent(ContentState.createFromText('asdf'));

            handleSubmit({ editorState }, { props: defaults });

            expect(defaults.onSubmit).toHaveBeenCalledWith('asdf');
        });
    });
});
