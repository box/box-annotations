import React from 'react';

import ActionControls from 'box-annotations/lib/components/ActionControls';

const onCreate = () => console.log('annotation comment clicked');
const onCommentClick = () => console.log('annotation canceled');
const IS_PENDING = true;
const USER = {
    id: '123',
    name: 'Sumedha Pramod'
};
const ANONYMOUS_USER = { id: '0' };
const CAN_DO_ACTION = true;

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls id='123' onCreate={onCreate} onCommentClick={onCommentClick} {...props}/>
    </div>
);

const PendingPlainHighlightControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION}
    />
);

const AnonymousPlainHighlightControls = () => (
    <ActionControlsContainer currentUser={ANONYMOUS_USER} type='highlight' permissions={{}}
    />
);

const PlainHighlightControls = () => (
    <ActionControlsContainer currentUser={USER} type='highlight' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION}
    />
);

const PendingHighlightCommentControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION}
    />
);

const AnonymousHighlightCommentControls = () => (
    <ActionControlsContainer currentUser={ANONYMOUS_USER} type='highlight-comment' permissions={{}} />
);

const HighlightCommentControls = () => (
    <ActionControlsContainer currentUser={USER} type='highlight-comment' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION} />
);

const DrawingControls = () => (
    <ActionControlsContainer currentUser={USER} type='draw' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION} />
);

const AnonymousDrawingControls = () => (
    <ActionControlsContainer type='draw' permissions={{}} />
);

const DeletableDrawingControls = () => (
    <ActionControlsContainer currentUser={USER} type='draw' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION} />
);

const ActionControlsExample = () => (
    <div className='ba'>
        <PendingPlainHighlightControls />
        <PlainHighlightControls />
        <AnonymousPlainHighlightControls />
        <PendingHighlightCommentControls />
        <AnonymousHighlightCommentControls />
        <HighlightCommentControls />
        <DrawingControls />
        <AnonymousDrawingControls />
        <DeletableDrawingControls />
    </div>
);

ActionControlsExample.displayName = 'ActionControls';

export default ActionControlsExample;