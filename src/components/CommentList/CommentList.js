// @flow
import React from 'react';

import Comment from '../Comment';

import './CommentList.scss';

type Props = {
    comments: Comments,
    onDelete: Function
};

const CommentList = ({ comments, onDelete }: Props) => (
    <ul className='ba-comment-list'>
        {comments.map(({ id, ...rest }) => (
            <li className='ba-comment-list-item' key={`annotation_${id}`}>
                <Comment id={id} onDelete={onDelete} {...rest} />
            </li>
        ))}
    </ul>
);

export default CommentList;
