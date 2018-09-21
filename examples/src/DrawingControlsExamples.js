import React from 'react';

/* eslint-disable-next-line */
import ActionControls from 'box-annotations/lib/components/ActionControls';

const onDelete = () => {};
const onCreate = () => {};

const DrawingControlsExamples = () => (
    <div className='ba'>
        <div className='action-controls-container'>
            <ActionControls type='draw' isPending={true} canAnnotate={true} canDelete={true} onDelete={onDelete} onCreate={onCreate} />
        </div>
    </div>
);

export default DrawingControlsExamples;