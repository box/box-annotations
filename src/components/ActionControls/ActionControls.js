// @flow
import React from 'react';

import { TYPES } from '../../constants';
import { isHighlightAnnotation } from '../../util';

import './ActionControls.scss';
import HighlightControls from './HighlightControls';
import DrawingControls from './DrawingControls';

type Props = {
    type: AnnotationType,
    canDelete: boolean,
    canAnnotate: boolean,
    canComment: boolean,
    isPending: boolean,
    onCreate: Function,
    onCommentClick: Function,
    onDelete: Function
};

const ActionControls = ({
    type,
    canDelete,
    canAnnotate,
    canComment,
    onCreate,
    onCommentClick,
    onDelete,
    isPending
}: Props) => {
    const isHighlight = isHighlightAnnotation(type);
    const isDrawing = type === TYPES.draw;

    return (
        <div className='ba-action-controls'>
            {isHighlight && (
                <HighlightControls
                    canDelete={canDelete}
                    canAnnotate={canAnnotate}
                    canComment={canComment}
                    isPending={isPending}
                    onCreate={onCreate}
                    onCommentClick={onCommentClick}
                />
            )}
            {isDrawing && (
                <DrawingControls
                    canAnnotate={canAnnotate}
                    canDelete={canDelete}
                    isPending={isPending}
                    onCreate={onCreate}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default ActionControls;
