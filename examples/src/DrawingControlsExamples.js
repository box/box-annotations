import React from 'react';

/* eslint-disable-next-line */
import ActionControls from 'box-annotations/lib/components/ActionControls';

const onDelete = () => {};

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls type='draw' canDelete={false} canAnnotate={false} onDelete={onDelete}  {...props}/>
    </div>
);

const DrawingControls = () => (
    <ActionControlsContainer />
);

const DeletableDrawingControls = () => (
    <ActionControlsContainer canDelete={true} />
);

const DrawingControlsExamples = () => (
    <div className='ba'>
        <DrawingControls />
        <DeletableDrawingControls />
    </div>
);

export default DrawingControlsExamples;