// @flow
import React from 'react';
import classNames from 'classnames';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';

import './HighlightControls.scss';

const CLASS_HIGHLIGHT_CONTROLS = 'ba-action-controls-highlight';
const CLASS_HIGHLIGHT_BTN = 'ba-highlight-btn';
const CLASS_HIGHLIGHT_COMMENT_BTN = 'ba-highlight-comment-btn';
const CLASS_SAVED_HIGHLIGHT = 'ba-saved-highlight';

type Props = {
    canAnnotateAndDelete: boolean,
    canComment: boolean,
    isPending?: boolean,
    onCreate: Function,
    onDelete: Function,
    onCommentClick: Function
};

const HighlightControls = ({
    canAnnotateAndDelete,
    canComment,
    onCreate,
    onDelete,
    onCommentClick,
    isPending
}: Props) => (
    <div className={CLASS_HIGHLIGHT_CONTROLS}>
        {canAnnotateAndDelete && (
            <PlainButton type='button' className={CLASS_HIGHLIGHT_BTN} onClick={isPending ? onCreate : onDelete}>
                <IconHighlightAnnotation
                    height={20}
                    width={20}
                    className={classNames({
                        [CLASS_SAVED_HIGHLIGHT]: !isPending
                    })}
                />
            </PlainButton>
        )}
        {canComment && (
            <PlainButton type='button' className={CLASS_HIGHLIGHT_COMMENT_BTN} onClick={onCommentClick}>
                <IconHighlightCommentAnnotation height={20} width={20} />
            </PlainButton>
        )}
    </div>
);

HighlightControls.defaultProps = {
    canAnnotateAndDelete: false,
    isPending: false
};

export default HighlightControls;
