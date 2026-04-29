import React from 'react';
import noop from 'lodash/noop';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { BlueprintModernizationProvider } from '@box/blueprint-web';
import {
    MentionContextProvider,
    ThreadedAnnotationsV2,
    serializeMentionMarkup,
} from '@box/threaded-annotations';
import type { DocumentNodeV2, TextMessageTypeV2 } from '@box/threaded-annotations';
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
import { fetchCollaboratorsAction } from '../../store/users/actions';

import type { AppState, AppThunkDispatch } from '../../store/types';

import createPopper, { PopupReference } from './Popper';
import type { Instance, Options } from './Popper';
import messages from './messages';
import './PopupReplyV2.scss';

export type Props = {
    annotationId: string;
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

const PopupThreadV2 = ({ annotationId, reference }: Props): JSX.Element => {
    const intl = useIntl();
    const dispatch = useDispatch<AppThunkDispatch>();
    const popupRef = React.useRef<HTMLDivElement>(null);
    const popperRef = React.useRef<Instance>();
    const optionsRef = React.useRef<Partial<Options>>(getPopupOptions());

    const annotation = useSelector((state: AppState) => getAnnotation(state, annotationId));

    React.useEffect(() => {
        if (popupRef.current) {
            popperRef.current = createPopper(reference, popupRef.current, optionsRef.current);
        }

        return () => {
            popperRef.current?.destroy();
        };
    }, [reference]);

    const handleEvent = React.useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
    }, []);

    const threadMessages: TextMessageTypeV2[] = React.useMemo(
        () => (annotation ? annotationToMessages(annotation) : []),
        [annotation],
    );

    const userSelectorProps = React.useMemo(
        () => ({
            allowEmptyQuery: true,
            ariaRoleDescription: intl.formatMessage(messages.ariaLabelMentionSelector),
            fetchAvatarUrls: async () => ({}),
            fetchUsers: async (query: string) => {
                const action = await dispatch(fetchCollaboratorsAction(query));
                if (fetchCollaboratorsAction.fulfilled.match(action)) {
                    return action.payload.entries.map(collaboratorToUserContact);
                }
                return [];
            },
            loadingAriaLabel: intl.formatMessage(messages.ariaLabelMentionLoading),
        }),
        [dispatch, intl],
    );

    const handlePost = React.useCallback(
        async (content: JSONContent | null): Promise<void> => {
            const doc = createDocumentNode(content);
            const { text } = serializeMentionMarkup(doc);
            await dispatch(createReplyAction({ annotationId, message: text }));
        },
        [annotationId, dispatch],
    );

    const handleThreadDelete = React.useCallback(
        async (): Promise<void> => {
            await dispatch(deleteAnnotationAction(annotationId));
        },
        [annotationId, dispatch],
    );

    const handleResolve = React.useCallback(
        async (): Promise<void> => {
            const result = await dispatch(updateAnnotationAction({ annotationId, payload: { status: 'resolved' } }));
            if (updateAnnotationAction.fulfilled.match(result)) {
                dispatch(setActiveAnnotationIdAction(null));
            }
        },
        [annotationId, dispatch],
    );

    const handleUnresolve = React.useCallback(
        async (): Promise<void> => {
            await dispatch(updateAnnotationAction({ annotationId, payload: { status: 'open' } }));
        },
        [annotationId, dispatch],
    );

    return (
        <FocusTrap>
            <div
                ref={popupRef}
                aria-label={intl.formatMessage(messages.ariaLabelComment)}
                className="ba-PopupReplyV2"
                data-resin-component="popupThreadV2"
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
                        <ThreadedAnnotationsV2
                            isAnnotations
                            messages={threadMessages}
                            onAvatarClick={noop}
                            onDelete={noop}
                            onPost={handlePost}
                            onResolve={handleResolve}
                            onThreadDelete={handleThreadDelete}
                            onUnresolve={handleUnresolve}
                            userSelectorProps={userSelectorProps}
                        />
                    </MentionContextProvider>
                </BlueprintModernizationProvider>
                <div data-threaded-annotations-portal />
            </div>
        </FocusTrap>
    );
};

export default PopupThreadV2;
