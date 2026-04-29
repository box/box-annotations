import React from 'react';
import { render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import PopupReplyV2, { Props } from '../PopupReplyV2';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('react-intl', () => ({
    defineMessages: (msgs: Record<string, unknown>) => msgs,
    useIntl: () => ({
        formatMessage: (msg: { defaultMessage: string }) => msg.defaultMessage,
    }),
}));

jest.mock('../PopupBase', () => {
    const ReactMock = jest.requireActual('react');
    const MockPopupBase = ReactMock.forwardRef(
        ({ children, ...rest }: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
            ReactMock.createElement(
                'div',
                { ref, 'data-testid': 'popup-base', ...rest },
                children,
            ),
    );
    MockPopupBase.displayName = 'MockPopupBase';
    return MockPopupBase;
});

jest.mock('box-ui-elements/es/components/focus-trap/FocusTrap', () => {
    const ReactMock = jest.requireActual('react');
    return ({ children }: { children: React.ReactNode }) =>
        ReactMock.createElement('div', { 'data-testid': 'focus-trap' }, children);
});

jest.mock('@box/threaded-annotations', () => {
    const ReactMock = jest.requireActual('react');
    return {
        MentionContextProvider: ({ children }: { children: React.ReactNode }) =>
            ReactMock.createElement('div', { 'data-testid': 'mention-context' }, children),
        ThreadedAnnotationsV2: (props: Record<string, unknown>) =>
            ReactMock.createElement('div', {
                'data-testid': 'threaded-annotations-v2',
                'data-messages-count': String((props.messages as unknown[])?.length ?? 0),
                'data-is-annotations': String(props.isAnnotations),
            }),
        serializeMentionMarkup: jest.fn().mockReturnValue({ hasMention: false, text: '' }),
    };
});

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('PopupReplyV2', () => {
    const defaults: Props = {
        isPending: false,
        onCancel: jest.fn(),
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };

    const mockDispatch = jest.fn();

    beforeEach(() => {
        mockUseDispatch.mockReturnValue(mockDispatch);
        // Selectors: rotation, scale, activeAnnotationId, activeAnnotation
        mockUseSelector
            .mockReturnValueOnce(0)     // rotation
            .mockReturnValueOnce(1)     // scale
            .mockReturnValueOnce(null)  // activeAnnotationId
            .mockReturnValueOnce(undefined); // activeAnnotation
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should render ThreadedAnnotationsV2 inside PopupBase with FocusTrap', () => {
        render(<PopupReplyV2 {...defaults} />);

        expect(screen.getByTestId('focus-trap')).toBeDefined();
        expect(screen.getByTestId('popup-base')).toBeDefined();
        expect(screen.getByTestId('mention-context')).toBeDefined();
        expect(screen.getByTestId('threaded-annotations-v2')).toBeDefined();
    });

    test('should render with isAnnotations=true', () => {
        render(<PopupReplyV2 {...defaults} />);

        const threadedAnnotations = screen.getByTestId('threaded-annotations-v2');
        expect(threadedAnnotations.getAttribute('data-is-annotations')).toBe('true');
    });

    test('should render with empty messages when no active annotation', () => {
        render(<PopupReplyV2 {...defaults} />);

        const threadedAnnotations = screen.getByTestId('threaded-annotations-v2');
        expect(threadedAnnotations.getAttribute('data-messages-count')).toBe('0');
    });

    test('should render with messages from active annotation', () => {
        mockUseSelector.mockReset();
        mockUseSelector
            .mockReturnValueOnce(0)     // rotation
            .mockReturnValueOnce(1)     // scale
            .mockReturnValueOnce('annotation-1') // activeAnnotationId
            .mockReturnValueOnce({      // activeAnnotation
                id: 'annotation-1',
                description: {
                    id: 'reply-1',
                    message: 'Hello world',
                    created_at: '2026-01-01T00:00:00Z',
                    created_by: { id: '100', name: 'Test User', login: 'test@box.com', type: 'user' },
                    type: 'reply',
                    parent: { id: 'annotation-1', type: 'annotation' },
                },
                replies: [],
                permissions: {},
                created_at: '2026-01-01T00:00:00Z',
                created_by: { id: '100', name: 'Test User', login: 'test@box.com', type: 'user' },
                modified_at: '2026-01-01T00:00:00Z',
                modified_by: { id: '100', name: 'Test User', login: 'test@box.com', type: 'user' },
                target: { type: 'point', location: { type: 'page', value: 1 }, x: 0, y: 0 },
                type: 'annotation',
            });

        render(<PopupReplyV2 {...defaults} />);

        const threadedAnnotations = screen.getByTestId('threaded-annotations-v2');
        expect(threadedAnnotations.getAttribute('data-messages-count')).toBe('1');
    });

    test('should set dialog role and aria-label on PopupBase', () => {
        render(<PopupReplyV2 {...defaults} />);

        const popupBase = screen.getByTestId('popup-base');
        expect(popupBase.getAttribute('role')).toBe('dialog');
        expect(popupBase.getAttribute('aria-label')).toBe('Comment');
    });
});
