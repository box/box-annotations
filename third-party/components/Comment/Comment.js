/* eslint-disable jsx-quotes, react/destructuring-assignment, lines-between-class-members, comma-dangle */
/**
 * @flow
 * @file Comment component
 */

import * as React from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import getProp from 'lodash/get';
import { ReadableTime } from 'box-ui-elements/es/components/time';
import Tooltip from 'box-ui-elements/es/components/tooltip';

import UserLink from './UserLink';
import InlineDelete from './InlineDelete';
import InlineEdit from './InlineEdit';
import CommentInlineError from './CommentInlineError';
import CommentText from './CommentText';
import ApprovalCommentForm from '../ApprovalCommentForm';
import formatTaggedMessage from '../../util/formatTaggedMessage';
import Avatar from '../Avatar';
import messages from '../../messages';
import { ACTIVITY_TARGETS } from '../../interactionTargets';

import './Comment.scss';
import { PLACEHOLDER_USER } from '../../../src/constants';

const ONE_HOUR_MS = 3600000; // 60 * 60 * 1000

type Props = {
    created_at: string | number,
    created_by?: User,
    currentUser: User,
    error?: ActionItemError,
    getAvatarUrl?: string => Promise<?string>,
    getMentionWithQuery?: Function,
    getUserProfileUrl?: string => Promise<string>,
    id: string,
    inlineDeleteMessage?: MessageDescriptor,
    isDisabled?: boolean,
    isPending?: boolean,
    is_reply_comment?: boolean,
    mentionSelectorContacts?: SelectorItems<>,
    modified_at?: string | number,
    onDelete?: Function,
    onEdit?: Function,
    permissions?: BoxItemPermission,
    tagged_message: string,
    translatedTaggedMessage?: string,
    translations?: Translations,
};

type State = {
    isEditing?: boolean,
    isFocused?: boolean,
    isInputOpen?: boolean,
};

class Comment extends React.Component<Props, State> {
    state = {
        isEditing: false,
        isFocused: false,
        isInputOpen: false,
    };

    onKeyDown = (event: SyntheticKeyboardEvent<>): void => {
        const { nativeEvent } = event;
        nativeEvent.stopImmediatePropagation();
    };

    approvalCommentFormFocusHandler = (): void => this.setState({ isInputOpen: true });
    approvalCommentFormCancelHandler = (): void => this.setState({ isInputOpen: false, isEditing: false });
    approvalCommentFormSubmitHandler = (): void => this.setState({ isInputOpen: false, isEditing: false });
    updateTaskHandler = (args: any): void => {
        const { onEdit = noop } = this.props;
        onEdit(args);
        this.approvalCommentFormSubmitHandler();
    };

    toEdit = (): void => this.setState({ isEditing: true, isInputOpen: true });

    handleCommentFocus = (): void => {
        this.setState({ isFocused: true });
    };

    handleCommentBlur = (): void => {
        this.setState({ isFocused: false });
    };

    render(): React.Node {
        const {
            created_by,
            created_at,
            permissions,
            id,
            inlineDeleteMessage = messages.commentDeletePrompt,
            isPending,
            error,
            onDelete,
            onEdit,
            tagged_message = '',
            translatedTaggedMessage,
            translations,
            currentUser,
            isDisabled,
            getAvatarUrl,
            getUserProfileUrl,
            getMentionWithQuery,
            mentionSelectorContacts,
        } = this.props;
        const { toEdit } = this;
        const { isEditing, isFocused, isInputOpen } = this.state;
        const createdAtTimestamp = new Date(created_at).getTime();
        const canDelete = getProp(permissions, 'can_delete', false);
        const canEdit = getProp(permissions, 'can_edit', false);
        const createdByUser = created_by || PLACEHOLDER_USER;
        const noopAvatarUrl = () => Promise.resolve();

        return (
            <div className="bcs-comment-container">
                <div
                    className={classNames('bcs-comment', {
                        'bcs-is-pending': isPending || error,
                        'bcs-is-focused': isFocused,
                    })}
                    onBlur={this.handleCommentBlur}
                    onFocus={this.handleCommentFocus}
                >
                    <Avatar className="bcs-comment-avatar" getAvatarUrl={getAvatarUrl} user={createdByUser} />
                    <div className="bcs-comment-content">
                        <div className="bcs-comment-headline">
                            {createdByUser !== PLACEHOLDER_USER && (
                                <UserLink
                                    className="bcs-comment-user-name"
                                    data-resin-target={ACTIVITY_TARGETS.PROFILE}
                                    getUserProfileUrl={getUserProfileUrl}
                                    id={createdByUser.id}
                                    name={createdByUser.name}
                                />
                            )}
                            <Tooltip
                                text={
                                    <FormattedMessage
                                        {...messages.commentPostedFullDateTime}
                                        values={{ time: createdAtTimestamp }}
                                    />
                                }
                            >
                                <small className="bcs-comment-created-at">
                                    <ReadableTime relativeThreshold={ONE_HOUR_MS} timestamp={createdAtTimestamp} />
                                </small>
                            </Tooltip>
                            {onEdit && canEdit && !isPending ? <InlineEdit id={id} toEdit={toEdit} /> : null}
                            {onDelete && canDelete && !isPending ? (
                                <InlineDelete
                                    id={id}
                                    message={<FormattedMessage {...inlineDeleteMessage} />}
                                    onDelete={onDelete}
                                    permissions={permissions}
                                />
                            ) : null}
                        </div>
                        {isEditing ? (
                            <ApprovalCommentForm
                                className={classNames('bcs-activity-feed-comment-input', {
                                    'bcs-is-disabled': isDisabled,
                                })}
                                entityId={id}
                                getAvatarUrl={getAvatarUrl || noopAvatarUrl}
                                getMentionWithQuery={getMentionWithQuery}
                                isDisabled={isDisabled}
                                isEditing={isEditing}
                                isOpen={isInputOpen}
                                mentionSelectorContacts={mentionSelectorContacts}
                                onCancel={this.approvalCommentFormCancelHandler}
                                onFocus={this.approvalCommentFormFocusHandler}
                                onSubmit={() => {}}
                                tagged_message={formatTaggedMessage(tagged_message, id, true, getUserProfileUrl)}
                                updateTask={this.updateTaskHandler}
                                user={currentUser}
                            />
                        ) : null}
                        {!isEditing ? (
                            <CommentText
                                getUserProfileUrl={getUserProfileUrl}
                                id={id}
                                tagged_message={tagged_message}
                                translatedTaggedMessage={translatedTaggedMessage}
                                translationFailed={error ? true : null}
                                {...translations}
                            />
                        ) : null}
                    </div>
                </div>
                {error ? <CommentInlineError {...error} /> : null}
            </div>
        );
    }
}

export default Comment;
