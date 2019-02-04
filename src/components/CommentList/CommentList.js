// @flow
import React from 'react';

import Comment from '../Comment';

import './CommentList.scss';

const CLASS_COMMENT_LIST = 'ba-comment-list';
const CLASS_COMMENT_LIST_ITEM = 'ba-comment-list-item';

type Props = {
    comments: Comments,
    onDelete: Function
};

class CommentList extends React.Component<Props> {
    commentsContainer: null | HTMLElement;

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    /**
     * Scrolls the container to the bottom
     * @return {void}
     */
    scrollToBottom = () => {
        if (this.commentsContainer) {
            this.commentsContainer.scrollTop = this.commentsContainer.scrollHeight;
        }
    };

    render() {
        const { comments, onDelete } = this.props;
        return (
            <ul
                className={CLASS_COMMENT_LIST}
                ref={(ref) => {
                    this.commentsContainer = ref;
                }}
            >
                {comments.map(({ id, ...rest }) => (
                    <li className={CLASS_COMMENT_LIST_ITEM} key={`annotation_${id}`}>
                        <Comment id={id} onDelete={onDelete} {...rest} />
                    </li>
                ))}
            </ul>
        );
    }
}

export default CommentList;
