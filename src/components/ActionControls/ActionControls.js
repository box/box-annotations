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
    onCreate: Function,
    onCommentClick: Function,
    onDelete: Function
};

const ActionControls = ({ type, canDelete, canAnnotate, canComment, onCreate, onCommentClick, onDelete }: Props) => {
    const isHighlight = isHighlightAnnotation(type);
    const isDrawing = type === TYPES.draw;

    return (
        <div className='ba-action-controls'>
            {isHighlight && (
                <HighlightControls
                    canDelete={canDelete}
                    canAnnotate={canAnnotate}
                    canComment={canComment}
                    onCreate={onCreate}
                    onCommentClick={onCommentClick}
                />
            )}
            {isDrawing && (
                <DrawingControls
                    canAnnotate={canAnnotate}
                    canDelete={canDelete}
                    onCreate={onCreate}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default ActionControls;
