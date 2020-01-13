// @flow
import React from 'react';

import PlainButton from 'box-ui-elements/es/components/plain-button';
import IconCheck from 'box-ui-elements/es/icons/general/IconCheck';
import IconTrash from 'box-ui-elements/es/icons/general/IconTrash';

import './DrawingControls.scss';

const CLASS_DRAW_CONTROLS = 'ba-action-controls-draw';
const CLASS_DRAWING_SAVE_BTN = 'ba-drawing-save-btn';
const CLASS_DRAWING_DELETE_BTN = 'ba-drawing-delete-btn';

type Props = {
    canDelete: boolean,
    isPending: boolean,
    onCreate: Function,
    onDelete: Function,
};

const DrawingControls = ({ isPending, canDelete, onCreate, onDelete }: Props) => (
    <div className={CLASS_DRAW_CONTROLS}>
        {isPending && (
            <PlainButton className={CLASS_DRAWING_SAVE_BTN} onClick={onCreate} type="button">
                <IconCheck />
            </PlainButton>
        )}
        {canDelete && (
            <PlainButton className={CLASS_DRAWING_DELETE_BTN} onClick={onDelete} type="button">
                <IconTrash height={20} width={20} />
            </PlainButton>
        )}
    </div>
);

DrawingControls.defaultProps = {
    canDelete: false,
};

export default DrawingControls;
