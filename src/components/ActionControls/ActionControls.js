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
    onCreate: Function,
    onCommentClick: Function,
    onDelete: Function
};

const ActionControls = ({ type, canDelete, canAnnotate, onCreate, onCommentClick, onDelete }: Props) => {
    const isHighlight = isHighlightAnnotation(type);
    const isDrawing = type === TYPES.draw;

    return (
        <div className='ba-action-controls'>
            {isHighlight && (
                <HighlightControls
                    canDelete={canDelete}
                    canAnnotate={canAnnotate}
                    onCreate={onCreate}
                    onCommentClick={onCommentClick}
                />
            )}
            {isDrawing && <DrawingControls canDelete={canDelete} onDelete={onDelete} />}
        </div>
    );
};

export default ActionControls;
