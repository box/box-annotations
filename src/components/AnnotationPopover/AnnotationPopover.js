// @flow
import React from 'react';
import noop from 'lodash/noop';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';
import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';

import './AnnotationPopover.scss';

type Props = {
    comments: Comments,
    canAnnotate: boolean,
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap
};

type State = {
    isInputOpen: boolean
};

const NULL_USER = {};

class AnnotationPopover extends React.Component<Props, State> {
    static defaultProps = {
        isPending: false,
        canAnnotate: false
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

    hasCommentAnnotations = () => {
        const { comments } = this.props;
        return comments.length > 0;
    };

    render() {
        const { comments, canAnnotate, onDelete, onCancel, onCreate, language, messages: intlMessages } = this.props;
        const { isInputOpen } = this.state;
        return (
            <Internationalize language={language} messages={intlMessages}>
                <Overlay className='ba-annotation-popover'>
                    {this.hasCommentAnnotations() && <CommentList comments={comments} onDelete={onDelete} />}
                    {canAnnotate && (
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
                    )}
                </Overlay>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
