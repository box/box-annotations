// @flow
import React from 'react';

import Comment from '../Comment';

import Internationalize from '../Internationalize';

import './CommentList.scss';

type Props = {
    comments: Comments,
    language?: string,
    messages?: StringMap,
    onDelete: Function
};

const CommentList = ({ comments, language, messages: intlMessages, onDelete }: Props) => (
    <Internationalize language={language} messages={intlMessages}>
        <ul className='ba-comment-list'>
            {comments.map(({ id, ...rest }) => (
                <li className='ba-comment-list-item' key={`annotation_${id}`}>
                    <Comment id={id} onDelete={onDelete} {...rest} />
                </li>
            ))}
        </ul>
    </Internationalize>
);

export default CommentList;
