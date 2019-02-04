// @flow
import * as React from 'react';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';

import { TYPES } from '../../constants';
import HighlightControls from './HighlightControls';
import DrawingControls from './DrawingControls';

import './ActionControls.scss';

const CLASS_ACTION_CONTROLS = 'ba-action-controls';
const CLASS_INPUT_CONTAINER = 'ba-annotation-input-container';

type Props = {
    id?: string,
    type: AnnotationType,
    canComment: boolean,
    canDelete: boolean,
    hasComments: boolean,
    isPending: boolean,
    onCreate: Function,
    onCommentClick: Function,
    onCancel: Function,
    onDelete: Function
};

type State = {
    isInputOpen: boolean
};

const NULL_USER = {};

class ActionControls extends React.Component<Props, State> {
    static defaultProps = {
        canComment: false,
        canDelete: false,
        isPending: false
    };

    state = {
        isInputOpen: true
    };

    componentDidMount() {
        this.onFocus();
    }

    componentWillUnmount() {
        this.setState({ isInputOpen: false });
    }

    onFocus = () => {
        this.setState({ isInputOpen: true });
    };

    onCancel = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ isInputOpen: false });

        const { onCancel } = this.props;
        onCancel();
    };

    onCreate = ({ text }: { text: string }) => {
        const { onCreate, type } = this.props;
        onCreate(type, text);
        this.setState({ isInputOpen: true });
    };

    onDelete = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ isInputOpen: false });

        const { onDelete, id } = this.props;
        onDelete({ id });
    };

    determineControls(type: string): ?React.Node {
        const { canComment, canDelete, onCommentClick, isPending, hasComments } = this.props;
        const { isInputOpen } = this.state;

        // NOTE: ActionControls are only displayed when the user has canAnnotate permissions
        // Any annotation created by the current user will also be deletable by that user
        switch (type) {
            case TYPES.highlight:
                // Do not display plain highlight controls if the user does not have
                // permissions to create/delete/comment annotations
                if (!canDelete && !canComment) {
                    return null;
                }

                return (
                    <HighlightControls
                        canAnnotateAndDelete={canDelete}
                        canComment={canComment}
                        isPending={isPending}
                        onDelete={this.onDelete}
                        onCreate={this.onCreate}
                        onCommentClick={onCommentClick}
                    />
                );
            case TYPES.highlight_comment:
                // Display the ApprovalCommentForm when adding the first comment
                // to a plain highlight or additional comments to highlight
                // comment annotations
                if (isPending || hasComments) {
                    return (
                        <ApprovalCommentForm
                            className={CLASS_INPUT_CONTAINER}
                            // $FlowFixMe
                            user={NULL_USER}
                            isOpen={isInputOpen}
                            isEditing={true}
                            createComment={this.onCreate}
                            onCancel={this.onCancel}
                            onSubmit={noop}
                            onFocus={this.onFocus}
                            // $FlowFixMe
                            getAvatarUrl={noop}
                        />
                    );
                }

                return (
                    <HighlightControls
                        canAnnotateAndDelete={canDelete}
                        canComment={true}
                        isPending={isPending}
                        onDelete={this.onDelete}
                        onCreate={this.onCreate}
                        onCommentClick={onCommentClick}
                    />
                );
            case TYPES.draw:
                // User cannot see any actions if they are unable to delete existing drawings.
                // Users will have delete permissions on any drawings that they create
                if (!canDelete) {
                    return null;
                }

                return (
                    <DrawingControls
                        canDelete={canDelete}
                        isPending={isPending}
                        onCreate={this.onCreate}
                        onDelete={this.onDelete}
                    />
                );
            case TYPES.point:
                // Users will always be able to add comments to existing point annotations
                // irrespective of whether or not they can create new point annotations
                return (
                    <ApprovalCommentForm
                        className={CLASS_INPUT_CONTAINER}
                        // $FlowFixMe
                        user={NULL_USER}
                        isOpen={isInputOpen}
                        isEditing={true}
                        createComment={this.onCreate}
                        onCancel={this.onCancel}
                        onSubmit={noop}
                        onFocus={this.onFocus}
                        // $FlowFixMe
                        getAvatarUrl={noop}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        const { type } = this.props;
        return <div className={CLASS_ACTION_CONTROLS}>{this.determineControls(type)}</div>;
    }
}

export default ActionControls;
