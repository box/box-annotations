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

const CommentList = ({ comments, onDelete }: Props) => (
    <ul className={CLASS_COMMENT_LIST}>
        {comments.map(({ id, ...rest }) => (
            <li className={CLASS_COMMENT_LIST_ITEM} key={`annotation_${id}`}>
                <Comment id={id} onDelete={onDelete} {...rest} />
            </li>
        ))}
    </ul>
);

export default CommentList;
