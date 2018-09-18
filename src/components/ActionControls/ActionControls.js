// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import getProp from 'lodash/get';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';
import IconClose from 'box-react-ui/lib/icons/general/IconClose';
import CommentText from '../../../third-party/components/Comment/CommentText';

import { TYPES } from '../../constants';
import { isHighlightAnnotation } from '../../util';
import Internationalize from '../Internationalize';

import messages from './messages';

import './ActionControls.scss';

type Props = {
    id: string,
    type: Annotations,
    itemPermissions: BoxItemPermissions,
    permissions: AnnotationPermissions,
    onCreate: Function,
    onCommentClick: Function,
    isPending: boolean,
    currentUser?: User,
    language?: string,
    messages?: StringMap,
    intl: any
};

class ActionControls extends React.PureComponent<Props> {
    getAnnotationLabel() {
        const { type, currentUser, intl } = this.props;
        const anonymousUserName = intl.formatMessage(messages.anonymousUserName);
        const annotatorName = !!currentUser && !!currentUser.name ? currentUser.name : anonymousUserName;

        let message = '';
        switch (type) {
            case TYPES.highlight:
            case TYPES.highlight_comment:
                message = intl.formatMessage(messages.whoHighlighted, { name: annotatorName });
                break;
            case TYPES.draw:
                message = intl.formatMessage(messages.whoDrew, { name: annotatorName });
                break;
            default:
                break;
        }
        return message;
    }

    render() {
        const {
            id,
            type,
            itemPermissions,
            permissions,
            onCreate,
            onCommentClick,
            isPending,
            language,
            messages: intlMessages
        } = this.props;
        const isHighlight = !!isHighlightAnnotation(type);
        const isDrawing = type === TYPES.draw;
        const canComment = !!(isHighlight && getProp(itemPermissions, 'can_annotate', false));
        const canDelete = getProp(permissions, 'can_delete', false);
        const annotatorLabelMessage = this.getAnnotationLabel();

        return (
            <Internationalize language={language} messages={intlMessages}>
                <div className='ba-action-controls'>
                    {!isPending && (
                        <span className='ba-annotation-label'>
                            <CommentText id={id} tagged_message={annotatorLabelMessage} translationEnabled={false} />
                        </span>
                    )}
                    {!!(isHighlight && canDelete) && (
                        <PlainButton type='button' className='ba-highlight-btn' onClick={onCreate}>
                            <IconHighlightAnnotation />
                        </PlainButton>
                    )}
                    {canComment && (
                        <PlainButton type='button' className='ba-highlight-comment-btn' onClick={onCommentClick}>
                            <IconHighlightCommentAnnotation />
                        </PlainButton>
                    )}
                    {!!(isDrawing && canDelete) && (
                        <PlainButton type='button' className='ba-drawing-delete-btn' onClick={onCommentClick}>
                            <IconClose />
                        </PlainButton>
                    )}
                </div>
            </Internationalize>
        );
    }
}

export default injectIntl(ActionControls);
