import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import PopupV2, { Props } from '../PopupV2';
import { getApiHost, getToken } from '../../../store/options';

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
        ThreadedAnnotationsV2: (props: Record<string, unknown>) =>
            ReactMock.createElement('div', {
                'data-testid': 'threaded-annotations-v2',
                'data-is-annotations': String(props.isAnnotations),
                'data-messages-count': String((props.messages as unknown[])?.length ?? 0),
                'data-has-on-post': String(typeof props.onPost === 'function'),
                'data-has-on-resolve': String(typeof props.onResolve === 'function'),
                'data-has-on-thread-delete': String(typeof props.onThreadDelete === 'function'),
                'data-has-on-unresolve': String(typeof props.onUnresolve === 'function'),
            }),
        serializeMentionMarkup: jest.fn().mockReturnValue({ hasMention: false, text: '' }),
    };
});

jest.mock('../../../store/annotations/actions', () => ({
    createReplyAction: jest.fn(),
    deleteAnnotationAction: jest.fn(),
    setActiveAnnotationIdAction: jest.fn(),
    updateAnnotationAction: Object.assign(jest.fn(), {
        fulfilled: { match: jest.fn().mockReturnValue(true) },
    }),
}));

jest.mock('../../../store/users/actions', () => ({
    fetchCollaboratorsAction: Object.assign(jest.fn(), {
        fulfilled: { match: jest.fn().mockReturnValue(false) },
    }),
}));

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

const mockSelectorValues = (annotation?: unknown): void => {
    mockUseSelector.mockImplementation(selector => {
        if (selector === getApiHost) return 'https://api.box.com';
        if (selector === getToken) return 'test-token';
        return annotation;
    });
};

describe('PopupV2', () => {
    const mockDispatch = jest.fn();
    const mockFetch = jest.fn();
    const originalFetch = window.fetch;
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;

    beforeAll(() => {
        window.fetch = mockFetch as unknown as typeof fetch;
        window.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
        window.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        window.fetch = originalFetch;
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    const flushPromises = (): Promise<void> => act(() => new Promise<void>(resolve => { setTimeout(resolve, 0); }));

    const mockAnnotation = {
        created_at: '2026-01-01T00:00:00Z',
        created_by: { id: '100', login: 'test@box.com', name: 'Test User', type: 'user' },
        description: {
            created_at: '2026-01-01T00:00:00Z',
            created_by: { id: '100', login: 'test@box.com', name: 'Test User', type: 'user' },
            id: 'reply-1',
            message: 'Hello world',
            parent: { id: 'annotation-1', type: 'annotation' },
            type: 'reply',
        },
        id: 'annotation-1',
        modified_at: '2026-01-01T00:00:00Z',
        modified_by: { id: '100', login: 'test@box.com', name: 'Test User', type: 'user' },
        permissions: { can_delete: true, can_edit: true, can_resolve: true },
        replies: [],
        target: { type: 'point', location: { type: 'page', value: 1 }, x: 0, y: 0 },
        type: 'annotation',
    };

    beforeEach(() => {
        mockUseDispatch.mockReturnValue(mockDispatch);
        mockFetch.mockResolvedValue({
            blob: () => Promise.resolve(new Blob(['avatar'])),
            ok: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create mode (no annotationId)', () => {
        const defaults: Props = {
            onSubmit: jest.fn(),
            reference: document.createElement('div'),
        };

        beforeEach(() => {
            mockSelectorValues(undefined);
        });

        test('should render MessageEditorV2 with FocusTrap and MentionContextProvider', () => {
            render(<PopupV2 {...defaults} />);

            expect(screen.getByTestId('focus-trap')).toBeVisible();
            expect(screen.getByTestId('mention-context')).toBeVisible();
            expect(screen.getByTestId('message-editor-v2')).toBeVisible();
            expect(screen.queryByTestId('threaded-annotations-v2')).toBeNull();
        });

        test('should render MessageEditorV2 with isFirstAnnotation=true', () => {
            render(<PopupV2 {...defaults} />);

            expect(screen.getByTestId('message-editor-v2').getAttribute('data-is-first-annotation')).toBe('true');
        });

        test('should set popupReplyV2 as resin component', () => {
            render(<PopupV2 {...defaults} />);

            const popup = screen.getByRole('presentation');
            expect(popup).toHaveAttribute('data-resin-component', 'popupReplyV2');
        });
    });

    describe('thread mode (with annotationId)', () => {
        const defaults: Props = {
            annotationId: 'annotation-1',
            onSubmit: jest.fn(),
            reference: document.createElement('div'),
        };

        beforeEach(() => {
            mockSelectorValues(mockAnnotation);
        });

        test('should render ThreadedAnnotationsV2 with FocusTrap and MentionContextProvider', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(screen.getByTestId('focus-trap')).toBeVisible();
            expect(screen.getByTestId('mention-context')).toBeVisible();
            expect(screen.getByTestId('threaded-annotations-v2')).toBeVisible();
            expect(screen.queryByTestId('message-editor-v2')).toBeNull();
        });

        test('should render with isAnnotations=true and messages from annotation', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            const thread = screen.getByTestId('threaded-annotations-v2');
            expect(thread.getAttribute('data-is-annotations')).toBe('true');
            expect(thread.getAttribute('data-messages-count')).toBe('1');
        });

        test('should render empty messages when annotation is not found', async () => {
            mockSelectorValues(undefined);
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(screen.getByTestId('threaded-annotations-v2').getAttribute('data-messages-count')).toBe('0');
        });

        test('should pass all action callbacks to ThreadedAnnotationsV2', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            const thread = screen.getByTestId('threaded-annotations-v2');
            expect(thread.getAttribute('data-has-on-post')).toBe('true');
            expect(thread.getAttribute('data-has-on-resolve')).toBe('true');
            expect(thread.getAttribute('data-has-on-thread-delete')).toBe('true');
            expect(thread.getAttribute('data-has-on-unresolve')).toBe('true');
        });

        test('should set popupThreadV2 as resin component', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            const popup = screen.getByRole('presentation');
            expect(popup).toHaveAttribute('data-resin-component', 'popupThreadV2');
        });

        test('should fetch avatars with Authorization header and no access_token query param', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.box.com/2.0/users/100/avatar?pic_type=large',
                { headers: { Authorization: 'Bearer test-token' } },
            );
            const [calledUrl] = mockFetch.mock.calls[0];
            expect(calledUrl).not.toContain('access_token');
        });
    });

    test('should set aria-label on popup container', () => {
        mockSelectorValues(undefined);
        render(<PopupV2 onSubmit={jest.fn()} reference={document.createElement('div')} />);

        expect(screen.getByRole('presentation')).toHaveAttribute('aria-label', 'Comment');
    });

    test('should render portal container for threaded-annotations popovers', () => {
        mockSelectorValues(undefined);
        render(<PopupV2 onSubmit={jest.fn()} reference={document.createElement('div')} />);

        const portal = screen.getByRole('presentation').querySelector('[data-threaded-annotations-portal]');
        expect(portal).not.toBeNull();
    });
});
