// @flow
import * as React from 'react';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';

import { TYPES } from '../../constants';
import HighlightControls from './HighlightControls';
import DrawingControls from './DrawingControls';

import './ActionControls.scss';

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
    };

    onDelete = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();

        const { onDelete, id } = this.props;
        onDelete({ id });
    };

    determineControls(type: string): ?React.Node {
        const { canComment, canDelete, onCommentClick, isPending, hasComments } = this.props;
        const { isInputOpen } = this.state;

        switch (type) {
            case TYPES.highlight:
                if (!canDelete) {
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
                if (isPending || hasComments) {
                    return (
                        <ApprovalCommentForm
                            className='ba-annotation-input-container'
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
                return (
                    <ApprovalCommentForm
                        className='ba-annotation-input-container'
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
        return <div className='ba-action-controls'>{this.determineControls(type)}</div>;
    }
}

export default ActionControls;
