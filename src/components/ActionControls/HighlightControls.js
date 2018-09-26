// @flow
import React from 'react';
import classNames from 'classnames';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';

import './HighlightControls.scss';

type Props = {
    canAnnotateAndDelete: boolean,
    canComment: boolean,
    isPending?: boolean,
    onCreate: Function,
    onCommentClick: Function
};

const HighlightControls = ({ canAnnotateAndDelete, canComment, onCreate, onCommentClick, isPending }: Props) => (
    <div className='ba-action-controls-highlight'>
        {canAnnotateAndDelete && (
            <PlainButton type='button' className='ba-highlight-btn' onClick={onCreate} isDisabled={isPending}>
                <IconHighlightAnnotation
                    className={classNames({
                        'ba-saved-highlight': !isPending
                    })}
                />
            </PlainButton>
        )}
        {canComment && (
            <PlainButton type='button' className='ba-highlight-comment-btn' onClick={onCommentClick}>
                <IconHighlightCommentAnnotation height={24} width={24} />
            </PlainButton>
        )}
    </div>
);

HighlightControls.defaultProps = {
    canAnnotateAndDelete: false,
    isPending: false
};

export default HighlightControls;
