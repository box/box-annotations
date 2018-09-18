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
const ITEM_PERMISSIONS = {
    can_annotate: true
};
const PERMISSIONS = {
    can_delete: true
};

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls id='123' onCreate={onCreate} onCommentClick={onCommentClick} {...props}/>
    </div>
);

const PendingPlainHighlightControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS}
    />
);

const AnonymousPlainHighlightControls = () => (
    <ActionControlsContainer currentUser={ANONYMOUS_USER} type='highlight' permissions={{}}
    />
);

const PlainHighlightControls = () => (
    <ActionControlsContainer currentUser={USER} type='highlight' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS}
    />
);

const PendingHighlightCommentControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS}
    />
);

const AnonymousHighlightCommentControls = () => (
    <ActionControlsContainer currentUser={ANONYMOUS_USER} type='highlight-comment' permissions={{}} />
);

const HighlightCommentControls = () => (
    <ActionControlsContainer currentUser={USER} type='highlight-comment' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS} />
);

const DrawingControls = () => (
    <ActionControlsContainer currentUser={USER} type='draw' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS} />
);

const AnonymousDrawingControls = () => (
    <ActionControlsContainer type='draw' permissions={{}} />
);

const DeletableDrawingControls = () => (
    <ActionControlsContainer currentUser={USER} type='draw' itemPermissions={ITEM_PERMISSIONS} permissions={PERMISSIONS} />
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