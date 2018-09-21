// @flow
import React from 'react';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconCheck from 'box-react-ui/lib/icons/general/IconCheck';
import IconTrash from 'box-react-ui/lib/icons/general/IconTrash';

import './DrawingControls.scss';

type Props = {
    canDelete: boolean,
    isPending: boolean,
    onCreate: Function,
    onDelete: Function
};

const DrawingControls = ({ isPending, canDelete, onCreate, onDelete }: Props) => (
    <div className='ba-action-controls-draw'>
        {isPending && (
            <PlainButton type='button' className='ba-drawing-save-btn' onClick={onCreate}>
                <IconCheck />
            </PlainButton>
        )}
        {canDelete && (
            <PlainButton type='button' className='ba-drawing-delete-btn' onClick={onDelete}>
                <IconTrash height={16} width={16} />
            </PlainButton>
        )}
    </div>
);

DrawingControls.defaultProps = {
    canDelete: false
};

export default DrawingControls;
