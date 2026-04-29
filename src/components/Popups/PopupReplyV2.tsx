import React from 'react';
import Popper from '@popperjs/core';
import noop from 'lodash/noop';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
    MentionContextProvider,
    ThreadedAnnotationsV2,
    serializeMentionMarkup,
} from '@box/threaded-annotations';
import type { DocumentNodeV2, TextMessageTypeV2 } from '@box/threaded-annotations';
import type { JSONContent } from '@tiptap/core';
import FocusTrap from 'box-ui-elements/es/components/focus-trap/FocusTrap';

import { annotationToMessages, collaboratorToUserContact } from '../../adapters/threadedAnnotationsAdapters';
import { fetchCollaboratorsAction } from '../../store/users/actions';
import { getActiveAnnotationId, getAnnotation } from '../../store/annotations/selectors';
import { getRotation, getScale } from '../../store/options';

import type { AppState, AppThunkDispatch } from '../../store/types';

import messages from './messages';
import PopupBase from './PopupBase';
import { PopupReference } from './Popper';
import './PopupReply.scss';

export type Props = {
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (text: string) => void;
    reference: PopupReference;
};

const isIE = (): boolean => {
    const { userAgent } = navigator;
    return userAgent.indexOf('Trident/') > 0;
};

const getPopupOptions = (): Partial<Popper.Options> => {
    const placement = isIE() ? 'top' : 'bottom';
    const modifiers: Popper.Options['modifiers'] = [
        { name: 'arrow', options: { element: '.ba-Popup-arrow', padding: 10 } },
        { name: 'flip', options: { altAxis: false, fallbackPlacements: ['bottom', 'top', 'left', 'right'] } },
        { name: 'offset', options: { offset: [0, 15] } },
        { name: 'preventOverflow', options: { padding: 5 } },
    ];

    if (isIE()) {
        modifiers.push({ name: 'eventListeners', options: { scroll: false } });
    }

    return { modifiers, placement };
};

const createDocumentNode = (content: JSONContent | null): DocumentNodeV2 => {
    if (!content) {
        return { type: 'doc', content: [] };
    }

    if (content.type === 'doc' && content.content) {
        return content as DocumentNodeV2;
    }

    return { type: 'doc', content: [content] } as DocumentNodeV2;
};

const PopupReplyV2 = ({ onSubmit, reference }: Props): JSX.Element => {
    const intl = useIntl();
    const dispatch = useDispatch<AppThunkDispatch>();
    const popupRef = React.useRef<PopupBase>(null);
    const popupOptions = React.useRef<Partial<Popper.Options>>(getPopupOptions());
    const rotation = useSelector(getRotation);
    const scale = useSelector(getScale);

    const activeAnnotationId = useSelector(getActiveAnnotationId);
    const activeAnnotation = useSelector((state: AppState) =>
        activeAnnotationId ? getAnnotation(state, activeAnnotationId) : undefined,
    );

    React.useEffect(() => {
        const { current: popup } = popupRef;

        if (popup?.popper) {
            popup.popper.update();
        }
    }, [popupRef, rotation, scale]);

    const threadMessages: TextMessageTypeV2[] = React.useMemo(
        () => (activeAnnotation ? annotationToMessages(activeAnnotation) : []),
        [activeAnnotation],
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
            onSubmit(text);
        },
        [onSubmit],
    );

    const handleDelete = React.useCallback(
        (): void => {
            // Deletion handled by parent via annotation removal
        },
        [],
    );

    return (
        <FocusTrap>
            <PopupBase
                ref={popupRef}
                aria-label={intl.formatMessage(messages.ariaLabelComment)}
                data-resin-component="popupReplyV2"
                options={popupOptions.current}
                reference={reference}
                role="dialog"
            >
                <MentionContextProvider value={{}}>
                    <ThreadedAnnotationsV2
                        isAnnotations
                        messages={threadMessages}
                        onAvatarClick={noop}
                        onDelete={handleDelete}
                        onPost={handlePost}
                        userSelectorProps={userSelectorProps}
                    />
                </MentionContextProvider>
            </PopupBase>
        </FocusTrap>
    );
};

export default PopupReplyV2;
