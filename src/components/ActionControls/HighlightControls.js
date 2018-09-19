// @flow
import React from 'react';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';

import './HighlightControls.scss';

type Props = {
    canDelete: boolean,
    canAnnotate: boolean,
    canComment: boolean,
    onCreate: Function,
    onCommentClick: Function
};

const HighlightControls = ({ canDelete, canAnnotate, canComment, onCreate, onCommentClick }: Props) => (
    <div className='ba-action-controls-highlight'>
        {canAnnotate &&
            canDelete && (
            <PlainButton type='button' className='ba-highlight-btn' onClick={onCreate}>
                <IconHighlightAnnotation />
            </PlainButton>
        )}
        {canComment && (
            <PlainButton type='button' className='ba-highlight-comment-btn' onClick={onCommentClick}>
                <IconHighlightCommentAnnotation />
            </PlainButton>
        )}
    </div>
);

HighlightControls.defaultProps = {
    canDelete: false,
    canAnnotate: false
};

export default HighlightControls;
