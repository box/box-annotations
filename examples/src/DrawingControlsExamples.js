import React from 'react';

/* eslint-disable-next-line */
import ActionControls from 'box-annotations/lib/components/ActionControls';

const onDelete = () => {};
const onCreate = () => {};

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls type='draw' canDelete={false} canAnnotate={false} onDelete={onDelete} onCreate={onCreate} {...props}/>
    </div>
);

const PendingDrawingControls = () => (
    <ActionControlsContainer isPending={true} canAnnotate={true} canDelete={true} />
);

const DeletableDrawingControls = () => (
    <ActionControlsContainer canDelete={true} />
);

const DrawingControlsExamples = () => (
    <div className='ba'>
        <PendingDrawingControls />
        <DeletableDrawingControls />
    </div>
);

export default DrawingControlsExamples;