import React from 'react';
import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import PopupReplyV2, { Props } from '../PopupReplyV2';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));

jest.mock('react-intl', () => ({
    defineMessages: (msgs: Record<string, unknown>) => msgs,
    useIntl: () => ({
        formatMessage: (msg: { defaultMessage: string }) => msg.defaultMessage,
    }),
}));

jest.mock('box-ui-elements/es/components/focus-trap/FocusTrap', () => {
    const ReactMock = jest.requireActual('react');
    return ({ children }: { children: React.ReactNode }) =>
        ReactMock.createElement('div', { 'data-testid': 'focus-trap' }, children);
});

jest.mock('@box/blueprint-web', () => ({
    BlueprintModernizationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@box/threaded-annotations', () => {
    const ReactMock = jest.requireActual('react');
    return {
        MentionContextProvider: ({ children }: { children: React.ReactNode }) =>
            ReactMock.createElement('div', { 'data-testid': 'mention-context' }, children),
        MessageEditorV2: (props: Record<string, unknown>) =>
            ReactMock.createElement('div', {
                'data-testid': 'message-editor-v2',
                'data-is-first-annotation': String(props.isFirstAnnotation),
            }),
        serializeMentionMarkup: jest.fn().mockReturnValue({ hasMention: false, text: '' }),
    };
});

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;

describe('PopupReplyV2', () => {
    const defaults: Props = {
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };

    const mockDispatch = jest.fn();

    beforeEach(() => {
        mockUseDispatch.mockReturnValue(mockDispatch);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should render MessageEditorV2 inside FocusTrap with MentionContextProvider', () => {
        render(<PopupReplyV2 {...defaults} />);

        expect(screen.getByTestId('focus-trap')).toBeVisible();
        expect(screen.getByTestId('mention-context')).toBeVisible();
        expect(screen.getByTestId('message-editor-v2')).toBeVisible();
    });

    test('should render MessageEditorV2 with isFirstAnnotation=true', () => {
        render(<PopupReplyV2 {...defaults} />);

        const editor = screen.getByTestId('message-editor-v2');
        expect(editor.getAttribute('data-is-first-annotation')).toBe('true');
    });

    test('should set presentation role and aria-label on popup container', () => {
        render(<PopupReplyV2 {...defaults} />);

        const popup = screen.getByRole('presentation');
        expect(popup).toHaveAttribute('aria-label', 'Comment');
    });

    test('should set data-resin-component on popup container', () => {
        render(<PopupReplyV2 {...defaults} />);

        const popup = screen.getByRole('presentation');
        expect(popup).toHaveAttribute('data-resin-component', 'popupReplyV2');
    });
});
