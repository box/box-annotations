import React from 'react';
import noop from 'lodash/noop';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { BlueprintModernizationProvider } from '@box/blueprint-web';
import {
    MentionContextProvider,
    MessageEditorV2,
    ThreadedAnnotationsV2,
    serializeMentionMarkup,
} from '@box/threaded-annotations';
import type { DocumentNodeV2, TextMessageTypeV2 } from '@box/threaded-annotations';
import type { FetchedAvatarUrls, UserContactType } from '@box/user-selector';
import type { JSONContent } from '@tiptap/core';
import FocusTrap from 'box-ui-elements/es/components/focus-trap/FocusTrap';

import { annotationToMessages, collaboratorToUserContact } from '../../adapters/threadedAnnotationsAdapters';
import {
    createReplyAction,
    deleteAnnotationAction,
    setActiveAnnotationIdAction,
    updateAnnotationAction,
} from '../../store/annotations/actions';
import { getAnnotation } from '../../store/annotations/selectors';
import { getApiHost, getToken } from '../../store/options';
import { fetchCollaboratorsAction } from '../../store/users/actions';

import type { AppState, AppThunkDispatch } from '../../store/types';

import createPopper, { PopupReference } from './Popper';
import type { Instance, Options } from './Popper';
import messages from './messages';
import './PopupV2.scss';

export type Props = {
    annotationId?: string;
    onSubmit: (text: string) => void;
    reference: PopupReference;
};

const getPopupOptions = (): Partial<Options> => ({
    modifiers: [
        { name: 'flip', options: { altAxis: false, fallbackPlacements: ['top', 'left', 'right'] } },
        { name: 'offset', options: { offset: [0, 15] } },
        { name: 'preventOverflow', options: { padding: 5 } },
    ],
    placement: 'bottom',
});

const createDocumentNode = (content: JSONContent | null): DocumentNodeV2 => {
    if (!content) {
        return { type: 'doc', content: [] };
    }

    if (content.type === 'doc' && content.content) {
        return content as DocumentNodeV2;
    }

    return { type: 'doc', content: [content] } as DocumentNodeV2;
};

// Callers render initials as a fallback on null.
// A persistent null across all users usually indicates a stale token.
const fetchAvatarBlob = async (apiHost: string, token: string, userId: string): Promise<string | null> => {
    try {
        const response = await fetch(`${apiHost}/2.0/users/${userId}/avatar?pic_type=large`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
};

const PopupV2 = ({ annotationId, onSubmit, reference }: Props): JSX.Element => {
    const intl = useIntl();
    const dispatch = useDispatch<AppThunkDispatch>();
    const popupRef = React.useRef<HTMLDivElement>(null);
    const popperRef = React.useRef<Instance>();
    const optionsRef = React.useRef<Partial<Options>>(getPopupOptions());

    const apiHost = useSelector(getApiHost);
    const token = useSelector(getToken);
    const annotation = useSelector((state: AppState) =>
        annotationId ? getAnnotation(state, annotationId) : undefined,
    );

    const [avatarBlobs, setAvatarBlobs] = React.useState<Record<string, string>>({});
    const avatarCacheRef = React.useRef<Map<string, string>>(new Map());
    const credentialsRef = React.useRef({ apiHost, token });
    credentialsRef.current = { apiHost, token };

    const getOrFetchAvatarBlob = React.useCallback(
        async (userId: string): Promise<string | null> => {
            const cached = avatarCacheRef.current.get(userId);
            if (cached) return cached;
            const capturedApiHost = apiHost;
            const capturedToken = token;
            const url = await fetchAvatarBlob(capturedApiHost, capturedToken, userId);
            if (!url) return null;
            if (
                credentialsRef.current.apiHost !== capturedApiHost ||
                credentialsRef.current.token !== capturedToken
            ) {
                URL.revokeObjectURL(url);
                return null;
            }
            const existing = avatarCacheRef.current.get(userId);
            if (existing) {
                URL.revokeObjectURL(url);
                return existing;
            }
            avatarCacheRef.current.set(userId, url);
            return url;
        },
        [apiHost, token],
    );

    React.useEffect(() => {
        if (popupRef.current) {
            popperRef.current = createPopper(reference, popupRef.current, optionsRef.current);
        }

        return () => {
            popperRef.current?.destroy();
        };
    }, [reference]);

    React.useEffect(() => {
        const cache = avatarCacheRef.current;
        return () => {
            cache.forEach(url => URL.revokeObjectURL(url));
            cache.clear();
        };
    }, []);

    React.useEffect(() => {
        avatarCacheRef.current.forEach(url => URL.revokeObjectURL(url));
        avatarCacheRef.current.clear();
        setAvatarBlobs({});
    }, [apiHost, token]);

    const handleEvent = React.useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
    }, []);

    React.useEffect(() => {
        if (!annotation) return undefined;

        const userIds = Array.from(
            new Set(annotationToMessages(annotation).map(msg => String(msg.author.id))),
        );
        let cancelled = false;

        Promise.all(userIds.map(async id => [id, await getOrFetchAvatarBlob(id)] as const)).then(entries => {
            if (cancelled) return;
            setAvatarBlobs(prev => {
                const next = { ...prev };
                entries.forEach(([id, url]) => {
                    if (url) next[id] = url;
                });
                return next;
            });
        });

        return () => {
            cancelled = true;
        };
    }, [annotation, getOrFetchAvatarBlob]);

    const threadMessages: TextMessageTypeV2[] = React.useMemo(() => {
        if (!annotation) return [];
        return annotationToMessages(annotation).map(msg => ({
            ...msg,
            author: {
                ...msg.author,
                avatarUrl: avatarBlobs[String(msg.author.id)],
            },
        }));
    }, [annotation, avatarBlobs]);

    const isResolved = annotation?.status === 'resolved';
    const resolvedBy = isResolved
        ? annotation?.resolution?.resolved_by?.name ?? annotation?.modified_by?.name
        : undefined;
    const resolvedAtSource = isResolved
        ? annotation?.resolution?.resolved_at ?? annotation?.modified_at
        : undefined;
    const resolvedAt = resolvedAtSource ? new Date(resolvedAtSource).getTime() : undefined;

    const userSelectorProps = React.useMemo(
        () => ({
            allowEmptyQuery: true,
            ariaRoleDescription: intl.formatMessage(messages.ariaLabelMentionSelector),
            fetchAvatarUrls: async (userContacts: UserContactType[]): Promise<FetchedAvatarUrls> => {
                const urls: FetchedAvatarUrls = {};
                await Promise.all(
                    userContacts.map(async ({ id }) => {
                        const key = String(id);
                        const blobUrl = await getOrFetchAvatarBlob(key);
                        if (blobUrl) {
                            urls[key] = blobUrl;
                        }
                    }),
                );
                return urls;
            },
            fetchUsers: async (query: string) => {
                const action = await dispatch(fetchCollaboratorsAction(query));
                if (fetchCollaboratorsAction.fulfilled.match(action)) {
                    return action.payload.entries.map(collaboratorToUserContact);
                }
                return [];
            },
            loadingAriaLabel: intl.formatMessage(messages.ariaLabelMentionLoading),
        }),
        [dispatch, getOrFetchAvatarBlob, intl],
    );

    const handlePost = React.useCallback(
        async (content: JSONContent | null): Promise<void> => {
            const doc = createDocumentNode(content);
            const { text } = serializeMentionMarkup(doc);
            if (annotationId) {
                await dispatch(createReplyAction({ annotationId, message: text }));
            } else {
                onSubmit(text);
            }
        },
        [annotationId, dispatch, onSubmit],
    );

    const handleThreadDelete = React.useCallback(
        async (): Promise<void> => {
            if (annotationId) {
                await dispatch(deleteAnnotationAction(annotationId));
            }
        },
        [annotationId, dispatch],
    );

    const handleResolve = React.useCallback(
        async (): Promise<void> => {
            if (!annotationId) return;
            const result = await dispatch(updateAnnotationAction({ annotationId, payload: { status: 'resolved' } }));
            if (updateAnnotationAction.fulfilled.match(result)) {
                dispatch(setActiveAnnotationIdAction(null));
            }
        },
        [annotationId, dispatch],
    );

    const handleUnresolve = React.useCallback(
        async (): Promise<void> => {
            if (!annotationId) return;
            await dispatch(updateAnnotationAction({ annotationId, payload: { status: 'open' } }));
        },
        [annotationId, dispatch],
    );

    return (
        <FocusTrap>
            <div
                ref={popupRef}
                aria-label={intl.formatMessage(messages.ariaLabelComment)}
                className="ba-PopupV2"
                data-resin-component={annotationId ? 'popupThreadV2' : 'popupReplyV2'}
                onClick={handleEvent}
                onMouseDown={handleEvent}
                onMouseMove={handleEvent}
                onMouseUp={handleEvent}
                onTouchMove={handleEvent}
                onTouchStart={handleEvent}
                role="presentation"
            >
                <BlueprintModernizationProvider enableModernizedComponents>
                    <MentionContextProvider value={{
                        collaborationPopoverProps: {
                            onSubmit: () => Promise.resolve(),
                        },
                    }}>
                        {annotationId ? (
                            <ThreadedAnnotationsV2
                                isAnnotations
                                isResolved={isResolved}
                                messages={threadMessages}
                                onAvatarClick={noop}
                                onDelete={noop}
                                onPost={handlePost}
                                onResolve={handleResolve}
                                onThreadDelete={handleThreadDelete}
                                onUnresolve={handleUnresolve}
                                resolvedAt={resolvedAt}
                                resolvedBy={resolvedBy}
                                userSelectorProps={userSelectorProps}
                            />
                        ) : (
                            <MessageEditorV2
                                isFirstAnnotation
                                onPost={handlePost}
                                userSelectorProps={userSelectorProps}
                            />
                        )}
                    </MentionContextProvider>
                </BlueprintModernizationProvider>
                <div data-threaded-annotations-portal />
            </div>
        </FocusTrap>
    );
};

export default PopupV2;
