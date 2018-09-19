// @flow
import React from 'react';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconClose from 'box-react-ui/lib/icons/general/IconClose';

import './DrawingControls.scss';

type Props = {
    canDelete: boolean,
    onDelete: Function
};

const DrawingControls = ({ canDelete, onDelete }: Props) => (
    <div className='ba-action-controls-draw'>
        {canDelete && (
            <PlainButton type='button' className='ba-drawing-delete-btn' onClick={onDelete}>
                <IconClose />
            </PlainButton>
        )}
    </div>
);

DrawingControls.defaultProps = {
    canDelete: false
};

export default DrawingControls;
