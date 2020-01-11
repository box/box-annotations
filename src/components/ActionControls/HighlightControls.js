// @flow
import React from 'react';
import classNames from 'classnames';

import PlainButton from 'box-ui-elements/es/components/plain-button';
import IconHighlightAnnotation from 'box-ui-elements/es/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-ui-elements/es/icons/annotations/IconHighlightCommentAnnotation';

import './HighlightControls.scss';

const CLASS_HIGHLIGHT_CONTROLS = 'ba-action-controls-highlight';
const CLASS_HIGHLIGHT_BTN = 'ba-highlight-btn';
const CLASS_HIGHLIGHT_COMMENT_BTN = 'ba-highlight-comment-btn';
const CLASS_SAVED_HIGHLIGHT = 'ba-saved-highlight';

type Props = {
    canAnnotateAndDelete: boolean,
    canComment: boolean,
    isPending?: boolean,
    onCommentClick: Function,
    onCreate: Function,
    onDelete: Function,
};

const HighlightControls = ({
    canAnnotateAndDelete,
    canComment,
    onCreate,
    onDelete,
    onCommentClick,
    isPending,
}: Props) => (
    <div className={CLASS_HIGHLIGHT_CONTROLS}>
        {canAnnotateAndDelete && (
            <PlainButton className={CLASS_HIGHLIGHT_BTN} onClick={isPending ? onCreate : onDelete} type="button">
                <IconHighlightAnnotation
                    className={classNames({
                        [CLASS_SAVED_HIGHLIGHT]: !isPending,
                    })}
                    height={20}
                    width={20}
                />
            </PlainButton>
        )}
        {canComment && (
            <PlainButton className={CLASS_HIGHLIGHT_COMMENT_BTN} onClick={onCommentClick} type="button">
                <IconHighlightCommentAnnotation height={20} width={20} />
            </PlainButton>
        )}
    </div>
);

HighlightControls.defaultProps = {
    canAnnotateAndDelete: false,
    isPending: false,
};

export default HighlightControls;
