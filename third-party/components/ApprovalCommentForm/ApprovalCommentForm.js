/* eslint-disable react/destructuring-assignment, react/no-access-state-in-setstate */
/**
 * @flow
 * @file Component for Approval comment form
 */

import * as React from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';

import Form from 'box-ui-elements/es/components/form-elements/form/Form';
import TextArea from 'box-ui-elements/es/components/form-elements/text-area/TextArea';
import commonMessages from 'box-ui-elements/es/common/messages';

import AddApproval from './AddApproval';
import CommentInputControls from './CommentInputControls';
import Avatar from '../Avatar';
import messages from '../../messages';

import './ApprovalCommentForm.scss';

type Props = {
    approverSelectorContacts?: SelectorItems<>,
    className: string,
    createComment?: Function,
    createTask?: Function,
    entityId?: string,
    getApproverWithQuery?: Function,
    getAvatarUrl: string => Promise<?string>,
    getMentionWithQuery?: Function,
    intl: any,
    isDisabled?: boolean,
    isEditing?: boolean,
    isOpen: boolean,
    mentionSelectorContacts?: SelectorItems<>,
    onCancel: Function,
    onFocus: Function,
    onSubmit: Function,
    tagged_message?: string,
    updateTask?: Function,
    user: User,
};

type State = {
    approvalDate?: Date,
    approverSelectorError: string,
    approvers: SelectorItems<>,
    commentText: string,
    isAddApprovalVisible: boolean,
};

class ApprovalCommentForm extends React.Component<Props, State> {
    static defaultProps = {
        isOpen: false,
    };

    state = {
        approvalDate: undefined,
        approvers: [],
        approverSelectorError: '',
        commentText: '',
        isAddApprovalVisible: false,
    };

    componentWillReceiveProps(nextProps: Props): void {
        const { isOpen } = nextProps;

        if (isOpen !== this.props.isOpen && !isOpen) {
            this.setState({
                commentText: this.props.tagged_message || '',
                isAddApprovalVisible: false,
            });
        }
    }

    onFormChangeHandler = ({ addApproval, commentText }: any): void =>
        this.setState({
            isAddApprovalVisible: addApproval === 'on',
            commentText,
        });

    onFormValidSubmitHandler = (formData: any): void => {
        const { createComment = noop, createTask = noop, intl, updateTask = noop, onSubmit, entityId } = this.props;

        const { commentText: text } = this.state;
        if (!text) {
            return;
        }

        if (formData.addApproval === 'on') {
            const { approvers, approvalDate } = this.state;
            if (approvers.length === 0) {
                this.setState({
                    approverSelectorError: intl.formatMessage(commonMessages.requiredFieldError),
                });
                return;
            }

            createTask({
                text,
                assignees: approvers,
                dueAt: approvalDate,
            });
        } else if (entityId) {
            updateTask({ text, id: entityId });
        } else {
            createComment({ text, hasMention: false });
        }

        if (onSubmit) {
            onSubmit();
        }

        this.setState({
            commentText: '',
            isAddApprovalVisible: false,
            approvalDate: undefined,
            approvers: [],
        });
    };

    onApprovalDateChangeHandler = (date: Date): void => {
        this.setState({ approvalDate: date });
    };

    handleApproverSelectorInput = (value: any): void => {
        const { getApproverWithQuery = noop } = this.props;
        getApproverWithQuery(value);
        this.setState({ approverSelectorError: '' });
    };

    handleApproverSelectorSelect = (pills: any): void => {
        this.setState({ approvers: this.state.approvers.concat(pills) });
    };

    handleApproverSelectorRemove = (option: any, index: number): void => {
        // eslint-disable-line
        const approvers = this.state.approvers.slice();
        approvers.splice(index, 1);
        this.setState({ approvers });
    };

    validateTextArea = (value: ?string) => {
        const { intl } = this.props;
        if (value && value.trim() === '') {
            return {
                message: intl.formatMessage(commonMessages.requiredFieldError),
            };
        }
        return null;
    };

    render(): React.Node {
        const {
            approverSelectorContacts,
            className,
            createTask,
            intl: { formatMessage },
            isOpen,
            onCancel,
            onFocus,
            user,
            isEditing,
            isDisabled,
            tagged_message,
            getAvatarUrl,
        } = this.props;
        const { approvalDate, approvers, approverSelectorError, commentText, isAddApprovalVisible } = this.state;
        const inputContainerClassNames = classNames('bcs-comment-input-container', className, {
            'bcs-comment-input-is-open': isOpen,
        });

        return (
            <div className={inputContainerClassNames}>
                {!isEditing && (
                    <div className="bcs-avatar-container">
                        <Avatar getAvatarUrl={getAvatarUrl} user={user} />
                    </div>
                )}
                <div className="bcs-comment-input-form-container">
                    <Form onChange={this.onFormChangeHandler} onValidSubmit={this.onFormValidSubmitHandler}>
                        <TextArea
                            autoFocus
                            className="bcs-comment-input"
                            hideLabel
                            isDisabled={isDisabled}
                            isRequired
                            label="Annotation Comment"
                            name="commentText"
                            onFocus={onFocus}
                            placeholder={tagged_message ? '' : formatMessage(messages.commentWrite)}
                            validation={this.validateTextArea}
                            value={commentText}
                        />
                        <aside
                            className={classNames('bcs-at-mention-tip', {
                                'accessibility-hidden': isOpen,
                            })}
                        >
                            <FormattedMessage {...messages.atMentionTip} />
                        </aside>
                        {createTask ? (
                            <AddApproval
                                approvalDate={approvalDate}
                                approvers={approvers}
                                approverSelectorContacts={approverSelectorContacts}
                                approverSelectorError={approverSelectorError}
                                formatMessage={formatMessage}
                                isAddApprovalVisible={isAddApprovalVisible}
                                onApprovalDateChange={this.onApprovalDateChangeHandler}
                                onApproverSelectorInput={this.handleApproverSelectorInput}
                                onApproverSelectorRemove={this.handleApproverSelectorRemove}
                                onApproverSelectorSelect={this.handleApproverSelectorSelect}
                            />
                        ) : null}
                        <CommentInputControls onCancel={onCancel} />
                    </Form>
                </div>
            </div>
        );
    }
}

// For testing only
export { ApprovalCommentForm as ApprovalCommentFormUnwrapped };

export default injectIntl(ApprovalCommentForm);
