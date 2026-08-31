import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { serializeMentionMarkup, serializeMessageToMarkdown } from '@box/threaded-annotations';
import type { MentionContextData, ThreadedAnnotationsPropsV2 } from '@box/threaded-annotations';
import AnnotationCallbacksContext from '../../../common/AnnotationCallbacksContext';
import PopupV2, { Props } from '../PopupV2';
import {
    createReplyAction,
    deleteReplyAction,
    updateAnnotationAction,
    updateReplyAction,
} from '../../../store/annotations/actions';
import { getApiHost, getFileId, getFileVersionId, getToken } from '../../../store/options';

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
    TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
}));

let lastMentionContextValue: MentionContextData = {};
let lastMessageEditorProps: {
    isFirstAnnotation?: boolean;
    isRichTextEnabled?: boolean;
    onPost?: (content: unknown) => Promise<void>;
} = {};
let lastThreadedAnnotationsProps: Partial<ThreadedAnnotationsPropsV2> = {};

jest.mock('@box/threaded-annotations', () => {
    const ReactMock = jest.requireActual('react');
    return {
        MentionContextProvider: ({ children, value }: { children: React.ReactNode; value: MentionContextData }) => {
            lastMentionContextValue = value;
            return ReactMock.createElement('div', { 'data-testid': 'mention-context' }, children);
        },
        MessageEditorV2: (props: {
            isFirstAnnotation?: boolean;
            isRichTextEnabled?: boolean;
            onPost?: (content: unknown) => Promise<void>;
        }) => {
            lastMessageEditorProps = props;
            return ReactMock.createElement('div', {
                'data-testid': 'message-editor-v2',
                'data-is-first-annotation': String(props.isFirstAnnotation),
                'data-is-rich-text-enabled': String(props.isRichTextEnabled),
            });
        },
        ThreadedAnnotationsV2: (props: Partial<ThreadedAnnotationsPropsV2>) => {
            lastThreadedAnnotationsProps = props;
            return ReactMock.createElement('div', {
                'data-testid': 'threaded-annotations-v2',
                'data-is-annotations': String(props.isAnnotations),
                'data-is-rich-text-enabled': String(props.isRichTextEnabled),
                'data-messages-count': String(props.messages?.length ?? 0),
                'data-has-on-edit': String(typeof props.onEdit === 'function'),
                'data-has-on-post': String(typeof props.onPost === 'function'),
                'data-has-on-resolve': String(typeof props.onResolve === 'function'),
                'data-has-on-thread-delete': String(typeof props.onThreadDelete === 'function'),
                'data-has-on-unresolve': String(typeof props.onUnresolve === 'function'),
            });
        },
        serializeMentionMarkup: jest.fn().mockReturnValue({ hasMention: false, text: 'serialized text' }),
        serializeMessageToMarkdown: jest.fn().mockReturnValue('markdown text'),
        parseMessageMarkdown: jest.fn().mockReturnValue({ type: 'doc', content: [] }),
    };
});

jest.mock('../../../store/annotations/actions', () => ({
    createReplyAction: jest.fn(),
    deleteAnnotationAction: jest.fn(),
    deleteReplyAction: jest.fn(),
    setActiveAnnotationIdAction: jest.fn(),
    updateAnnotationAction: Object.assign(jest.fn(), {
        fulfilled: { match: jest.fn().mockReturnValue(true) },
    }),
    updateReplyAction: jest.fn(),
}));

jest.mock('../../../store/users/actions', () => ({
    fetchCollaboratorsAction: Object.assign(jest.fn(), {
        fulfilled: { match: jest.fn().mockReturnValue(false) },
    }),
}));

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

type SelectorOverrides = {
    annotation?: unknown;
    apiHost?: string;
    fileId?: string | null;
    fileVersionId?: string | null;
    isRichTextEnabled?: boolean;
    token?: unknown;
};

const mockSelectorValues = ({
    annotation,
    apiHost = 'https://api.box.com',
    fileId = '12345',
    fileVersionId = 'fv-1',
    isRichTextEnabled = false,
    token = 'test-token',
}: SelectorOverrides = {}): void => {
    mockUseSelector.mockImplementation(selector => {
        if (selector === getApiHost) return apiHost;
        if (selector === getFileId) return fileId;
        if (selector === getFileVersionId) return fileVersionId;
        if (selector === getToken) return token;
        const result = selector({
            annotations: { byId: {} },
            options: { features: { isRichTextEnabled } },
        });
        return typeof result === 'boolean' ? result : annotation;
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

    const flushPromises = (): Promise<void> =>
        act(
            () =>
                new Promise<void>(resolve => {
                    setTimeout(resolve, 0);
                }),
        );

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
        lastMentionContextValue = {};
        lastMessageEditorProps = {};
        lastThreadedAnnotationsProps = {};
        mockUseDispatch.mockReturnValue(mockDispatch);
        mockFetch.mockResolvedValue({
            blob: () => Promise.resolve(new Blob(['avatar'])),
            ok: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const makePortalEl = (): HTMLElement => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        return el;
    };

    describe('create mode (no annotationId)', () => {
        const defaults: Props = {
            onSubmit: jest.fn(),
            popupPortalEl: makePortalEl(),
            reference: document.createElement('div'),
        };

        beforeEach(() => {
            mockSelectorValues();
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
            expect(screen.getByTestId('message-editor-v2').getAttribute('data-is-rich-text-enabled')).toBe('false');
        });

        test('should pass isRichTextEnabled to MessageEditorV2 when the feature is on', () => {
            mockSelectorValues({ isRichTextEnabled: true });
            render(<PopupV2 {...defaults} />);

            expect(screen.getByTestId('message-editor-v2').getAttribute('data-is-rich-text-enabled')).toBe('true');
        });

        test('should serialize mention markup when posting a new annotation with rich text disabled', async () => {
            render(<PopupV2 {...defaults} />);

            await lastMessageEditorProps.onPost?.({ type: 'doc', content: [] });

            expect(serializeMentionMarkup).toHaveBeenCalled();
            expect(serializeMessageToMarkdown).not.toHaveBeenCalled();
            expect(defaults.onSubmit).toHaveBeenCalledWith('serialized text');
        });

        test('should serialize markdown when posting a new annotation with rich text enabled', async () => {
            mockSelectorValues({ isRichTextEnabled: true });
            render(<PopupV2 {...defaults} />);

            await lastMessageEditorProps.onPost?.({ type: 'doc', content: [] });

            expect(serializeMessageToMarkdown).toHaveBeenCalled();
            expect(serializeMentionMarkup).not.toHaveBeenCalled();
            expect(defaults.onSubmit).toHaveBeenCalledWith('markdown text');
        });

        test('should set popupReplyV2 as resin component', () => {
            render(<PopupV2 {...defaults} />);

            const popup = screen.getByRole('presentation');
            expect(popup).toHaveAttribute('data-resin-component', 'popupReplyV2');
        });

        // Mention contacts are file collaborators, so fetchCollaboratorState must resolve true
        // or threaded-annotations opens the non-collaborator invite popover after every mention
        test('should provide fetchCollaboratorState resolving true so the invite popover never opens', async () => {
            render(<PopupV2 {...defaults} />);

            const user = {
                id: 100,
                email: 'test@box.com',
                name: 'Test User',
                type: 'user' as const,
                value: 'test@box.com',
            };
            await expect(lastMentionContextValue.fetchCollaboratorState?.(user)).resolves.toBe(true);
        });
    });

    describe('thread mode (with annotationId)', () => {
        const defaults: Props = {
            annotationId: 'annotation-1',
            onSubmit: jest.fn(),
            popupPortalEl: makePortalEl(),
            reference: document.createElement('div'),
        };

        beforeEach(() => {
            mockSelectorValues({ annotation: mockAnnotation });
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
            expect(thread.getAttribute('data-is-rich-text-enabled')).toBe('false');
            expect(thread.getAttribute('data-messages-count')).toBe('1');
        });

        test('should pass isRichTextEnabled to ThreadedAnnotationsV2 when the feature is on', async () => {
            mockSelectorValues({ annotation: mockAnnotation, isRichTextEnabled: true });
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(screen.getByTestId('threaded-annotations-v2').getAttribute('data-is-rich-text-enabled')).toBe(
                'true',
            );
        });

        test('should render empty messages when annotation is not found', async () => {
            mockSelectorValues();
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(screen.getByTestId('threaded-annotations-v2').getAttribute('data-messages-count')).toBe('0');
        });

        test('should pass all action callbacks to ThreadedAnnotationsV2', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            const thread = screen.getByTestId('threaded-annotations-v2');
            expect(thread.getAttribute('data-has-on-edit')).toBe('true');
            expect(thread.getAttribute('data-has-on-post')).toBe('true');
            expect(thread.getAttribute('data-has-on-resolve')).toBe('true');
            expect(thread.getAttribute('data-has-on-thread-delete')).toBe('true');
            expect(thread.getAttribute('data-has-on-unresolve')).toBe('true');
        });

        test('should dispatch updateAnnotationAction when editing the root message', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onEdit?.('annotation-1', { type: 'doc', content: [] });

            expect(updateAnnotationAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                payload: { message: 'serialized text' },
            });
        });

        test('should dispatch updateReplyAction (not updateAnnotationAction) when editing a reply', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onEdit?.('reply-1', { type: 'doc', content: [] });

            expect(updateAnnotationAction).not.toHaveBeenCalled();
            expect(updateReplyAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                replyId: 'reply-1',
                payload: { message: 'serialized text' },
            });
        });

        test('should serialize markdown when editing the root message with rich text enabled', async () => {
            mockSelectorValues({ annotation: mockAnnotation, isRichTextEnabled: true });
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onEdit?.('annotation-1', { type: 'doc', content: [] });

            expect(serializeMessageToMarkdown).toHaveBeenCalled();
            expect(serializeMentionMarkup).not.toHaveBeenCalled();
            expect(updateAnnotationAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                payload: { message: 'markdown text' },
            });
        });

        test('should dispatch createReplyAction with mention markup when posting a reply', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onPost?.({ type: 'doc', content: [] });

            expect(serializeMentionMarkup).toHaveBeenCalled();
            expect(serializeMessageToMarkdown).not.toHaveBeenCalled();
            expect(createReplyAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                message: 'serialized text',
            });
        });

        test('should serialize markdown when posting a reply with rich text enabled', async () => {
            mockSelectorValues({ annotation: mockAnnotation, isRichTextEnabled: true });
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onPost?.({ type: 'doc', content: [] });

            expect(serializeMessageToMarkdown).toHaveBeenCalled();
            expect(serializeMentionMarkup).not.toHaveBeenCalled();
            expect(createReplyAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                message: 'markdown text',
            });
        });

        test('should dispatch deleteReplyAction when a reply is deleted', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onDelete?.('reply-1');

            expect(deleteReplyAction).toHaveBeenCalledWith({
                annotationId: 'annotation-1',
                replyId: 'reply-1',
            });
        });

        test('should not dispatch deleteReplyAction when deleting the root annotation id', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            await lastThreadedAnnotationsProps.onDelete?.('annotation-1');

            expect(deleteReplyAction).not.toHaveBeenCalled();
        });

        test('should invoke context onCopyLink with the root annotationId and fileVersionId regardless of clicked message id', async () => {
            const onCopyLink = jest.fn();
            render(
                <AnnotationCallbacksContext.Provider value={{ onCopyLink }}>
                    <PopupV2 {...defaults} />
                </AnnotationCallbacksContext.Provider>,
            );
            await flushPromises();

            (lastThreadedAnnotationsProps.onCopyLink as (id: string) => void)('reply-1');

            expect(onCopyLink).toHaveBeenCalledWith({ annotationId: 'annotation-1', fileVersionId: 'fv-1' });
        });

        test('should leave onCopyLink undefined when fileVersionId is missing from the store', async () => {
            const onCopyLink = jest.fn();
            mockSelectorValues({ annotation: mockAnnotation, fileVersionId: null });
            render(
                <AnnotationCallbacksContext.Provider value={{ onCopyLink }}>
                    <PopupV2 {...defaults} />
                </AnnotationCallbacksContext.Provider>,
            );
            await flushPromises();

            expect(lastThreadedAnnotationsProps.onCopyLink).toBeUndefined();
        });

        test('should leave onCopyLink undefined when no context value is provided', async () => {
            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(lastThreadedAnnotationsProps.onCopyLink).toBeUndefined();
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

            expect(mockFetch).toHaveBeenCalledWith('https://api.box.com/2.0/users/100/avatar?pic_type=large', {
                headers: { Authorization: 'Bearer test-token' },
            });
            const [calledUrl] = mockFetch.mock.calls[0];
            expect(calledUrl).not.toContain('access_token');
        });

        test('should resolve a function token by typed file id before building Authorization header', async () => {
            const tokenResolver = jest.fn().mockResolvedValue('resolved-token');
            mockSelectorValues({ annotation: mockAnnotation, token: tokenResolver });

            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(tokenResolver).toHaveBeenCalledWith('file_12345');
            expect(mockFetch).toHaveBeenCalledWith('https://api.box.com/2.0/users/100/avatar?pic_type=large', {
                headers: { Authorization: 'Bearer resolved-token' },
            });
        });

        test('should resolve a per-file map token by extracting the read string', async () => {
            const tokenMap = { file_12345: { read: 'read-token', write: 'write-token' } };
            mockSelectorValues({ annotation: mockAnnotation, token: tokenMap });

            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(mockFetch).toHaveBeenCalledWith('https://api.box.com/2.0/users/100/avatar?pic_type=large', {
                headers: { Authorization: 'Bearer read-token' },
            });
        });

        test('should not call fetch when fileId is missing', async () => {
            mockSelectorValues({ annotation: mockAnnotation, fileId: null });

            render(<PopupV2 {...defaults} />);
            await flushPromises();

            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    test('should set aria-label on popup container', () => {
        mockSelectorValues();
        render(
            <PopupV2 onSubmit={jest.fn()} popupPortalEl={makePortalEl()} reference={document.createElement('div')} />,
        );

        expect(screen.getByRole('presentation')).toHaveAttribute('aria-label', 'Comment');
    });

    test('should render portal container for threaded-annotations popovers', () => {
        mockSelectorValues();
        render(
            <PopupV2 onSubmit={jest.fn()} popupPortalEl={makePortalEl()} reference={document.createElement('div')} />,
        );

        const portal = screen.getByRole('presentation').querySelector('[data-threaded-annotations-portal]');
        expect(portal).not.toBeNull();
    });

    test('should render popup into popupPortalEl, not the render container', () => {
        mockSelectorValues();
        const portalEl = makePortalEl();
        const { container } = render(
            <PopupV2 onSubmit={jest.fn()} popupPortalEl={portalEl} reference={document.createElement('div')} />,
        );

        expect(container.querySelector('.ba-PopupV2')).toBeNull();
        expect(portalEl.querySelector('.ba-PopupV2')).toBeVisible();
    });

    test('should render nothing when popupPortalEl is missing', () => {
        mockSelectorValues();
        const { container } = render(<PopupV2 onSubmit={jest.fn()} reference={document.createElement('div')} />);

        expect(container.querySelector('.ba-PopupV2')).toBeNull();
        expect(document.body.querySelector('.ba-PopupV2')).toBeNull();
    });
});
