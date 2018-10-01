// @flow
import * as React from 'react';
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
        onDelete: noop,
        onCancel: noop
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

    determineControls(type: string): ?React.Node {
        const { canDelete, onCreate, onCommentClick, onDelete, onCancel, isPending } = this.props;
        const { isInputOpen } = this.state;

        switch (type) {
            case TYPES.highlight:
                if (!canDelete) {
                    return null;
                }

                return (
                    <HighlightControls
                        canAnnotateAndDelete={canDelete}
                        canComment={false}
                        isPending={isPending}
                        onCreate={onCreate}
                        onCommentClick={onCommentClick}
                    />
                );
            case TYPES.highlight_comment:
                if (isPending) {
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
                }

                return (
                    <HighlightControls
                        canAnnotateAndDelete={canDelete}
                        canComment={true}
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
    }

    render() {
        const { type } = this.props;
        return <div className='ba-action-controls'>{this.determineControls(type)}</div>;
    }
}

export default ActionControls;
