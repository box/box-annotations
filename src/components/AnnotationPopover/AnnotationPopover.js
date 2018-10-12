// @flow
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';
import AnnotatorLabel from './AnnotatorLabel';

type Props = {
    canComment: boolean,
    position: Function,
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    onCommentClick: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap
} & Annotation;

class AnnotationPopover extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        canAnnotate: false,
        canComment: false,
        canDelete: false,
        onCommentClick: noop,
        onDelete: noop,
        onCancel: noop,
        onCreate: noop,
        comments: []
    };

    componentDidMount() {
        const { position } = this.props;
        position();
    }

    render() {
        const {
            id,
            type,
            createdAt,
            createdBy,
            comments,
            canComment,
            canAnnotate,
            isPending,
            canDelete,
            onDelete,
            onCancel,
            onCreate,
            onCommentClick,
            language,
            messages: intlMessages
        } = this.props;

        return (
            <Internationalize language={language} messages={intlMessages}>
                <div className='ba-popover'>
                    <span className='ba-popover-caret' />
                    <Overlay
                        className={classNames('ba-popover-overlay', {
                            'ba-inline': !isPending && comments.length === 0,
                            'ba-create-popover': isPending
                        })}
                    >
                        {comments.length > 0 ? (
                            <CommentList comments={comments} onDelete={onDelete} />
                        ) : (
                            <AnnotatorLabel id={id} type={type} createdBy={createdBy} isPending={isPending} />
                        )}
                        {canAnnotate && (
                            <ActionControls
                                id={id}
                                type={type}
                                hasComments={comments.length > 0}
                                isPending={isPending}
                                canComment={canComment}
                                canDelete={canDelete}
                                createdBy={createdBy}
                                createdAt={createdAt}
                                onCreate={onCreate}
                                onCancel={onCancel}
                                onDelete={onDelete}
                                onCommentClick={onCommentClick}
                            />
                        )}
                    </Overlay>
                </div>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
