// @flow
import React from 'react';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconCheck from 'box-react-ui/lib/icons/general/IconCheck';
import IconTrash from 'box-react-ui/lib/icons/general/IconTrash';

import './DrawingControls.scss';

const CLASS_DRAW_CONTROLS = 'ba-action-controls-draw';
const CLASS_DRAWING_SAVE_BTN = 'ba-drawing-save-btn';
const CLASS_DRAWING_DELETE_BTN = 'ba-drawing-delete-btn';

type Props = {
    canDelete: boolean,
    isPending: boolean,
    onCreate: Function,
    onDelete: Function
};

const DrawingControls = ({ isPending, canDelete, onCreate, onDelete }: Props) => (
    <div className={CLASS_DRAW_CONTROLS}>
        {isPending && (
            <PlainButton type='button' className={CLASS_DRAWING_SAVE_BTN} onClick={onCreate}>
                <IconCheck />
            </PlainButton>
        )}
        {canDelete && (
            <PlainButton type='button' className={CLASS_DRAWING_DELETE_BTN} onClick={onDelete}>
                <IconTrash height={20} width={20} />
            </PlainButton>
        )}
    </div>
);

DrawingControls.defaultProps = {
    canDelete: false
};

export default DrawingControls;
