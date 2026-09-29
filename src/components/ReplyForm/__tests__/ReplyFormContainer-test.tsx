import { EditorState, ContentState } from 'draft-js';
import { mapStateToProps, mapPropsToValues, validate, handleSubmit } from '../ReplyFormContainer';
import { AppState } from '../../../store';

jest.mock('../../../store');

describe('ReplyFormContainer', () => {
    const defaults = {
        cursorPosition: 0,
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
    };

    describe('mapStateToProps()', () => {
        test('should set props', () => {
            expect(mapStateToProps({} as AppState)).toEqual({
                cursorPosition: 1,
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

        test('should clamp the cursor position to the end of the text', () => {
            const { editorState } = mapPropsToValues({ ...defaults, cursorPosition: 10, value: 'abc' });

            expect(editorState.getSelection().getAnchorOffset()).toBe(3);
            expect(editorState.getSelection().getFocusOffset()).toBe(3);
        });

        test('should convert mention markup in the value into a mention entity', () => {
            const { editorState } = mapPropsToValues({ ...defaults, value: '@[123:Test User] hello' });
            const content = editorState.getCurrentContent();
            const block = content.getFirstBlock();
            const entityKey = block.getEntityAt(0);

            expect(content.getPlainText()).toBe('@Test User hello');
            expect(entityKey).not.toBeNull();
            expect(content.getEntity(entityKey).getType()).toBe('MENTION');
            expect(content.getEntity(entityKey).getData()).toEqual({
                content: '@Test User',
                id: '123',
                name: 'Test User',
            });
            expect(block.getEntityAt('@Test User'.length)).toBeNull();
        });
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
