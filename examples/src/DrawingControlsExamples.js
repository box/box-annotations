import React from 'react';

import ActionControls from 'box-annotations/lib/components/ActionControls';

const onDelete = () => console.log('drawing deleted');
const CAN_DO_ACTION = true;
const CANNOT_DO_ACTION = false;

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls type='draw' canDelete={CANNOT_DO_ACTION} canAnnotate={CANNOT_DO_ACTION} onDelete={onDelete}  {...props}/>
    </div>
);

const DrawingControls = () => (
    <ActionControlsContainer />
);

const DeletableDrawingControls = () => (
    <ActionControlsContainer canDelete={CAN_DO_ACTION} />
);

const ActionControlsExample = () => (
    <div className='ba'>
        <DrawingControls />
        <DeletableDrawingControls />
    </div>
);

ActionControlsExample.displayName = 'ActionControls';

export default ActionControlsExample;