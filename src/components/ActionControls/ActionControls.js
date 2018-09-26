// @flow
import React from 'react';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';

import { TYPES } from '../../constants';
import HighlightControls from './HighlightControls';
import DrawingControls from './DrawingControls';

import './ActionControls.scss';

type Props = {
    type: AnnotationType,
    canDelete: boolean,
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
        canDelete: false,
        isPending: false,
        onCommentClick: noop,
        onDelete: noop
    };

    state = {
        isInputOpen: true
    };

    componentWillMount() {
        this.setState({ isInputOpen: true });
    }

    componentWillUnmount() {
        this.setState({ isInputOpen: false });
    }

    render() {
        const { type, canDelete, onCreate, onCommentClick, onDelete, onCancel, isPending } = this.props;
        const { isInputOpen } = this.state;
        const canComment = type === TYPES.highlight_comment;

        const TypeControls = () => {
            switch (type) {
                case TYPES.highlight:
                case TYPES.highlight_comment:
                    if (!canComment && !canDelete) {
                        return null;
                    }

                    return (
                        <HighlightControls
                            canAnnotateAndDelete={canDelete}
                            canComment={canComment}
                            isPending={isPending}
                            onCreate={onCreate}
                            onCommentClick={onCommentClick}
                        />
                    );
                case TYPES.draw:
                    return (
                        <DrawingControls
                            canDelete={canDelete}
                            isPending={isPending}
                            onCreate={onCreate}
                            onDelete={onDelete}
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
                            createComment={onCreate}
                            onCancel={onCancel}
                            onSubmit={noop}
                            onFocus={noop}
                            // $FlowFixMe
                            getAvatarUrl={noop}
                        />
                    );
                default:
                    return null;
            }
        };

        return (
            <div className='ba-action-controls'>
                <TypeControls />
            </div>
        );
    }
}

export default ActionControls;
