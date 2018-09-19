import React from 'react';

import ActionControls from 'box-annotations/lib/components/ActionControls';

const onCreate = () => console.log('annotation comment clicked');
const onCommentClick = () => console.log('annotation canceled');
const IS_PENDING = true;
const CAN_DO_ACTION = true;
const CANNOT_DO_ACTION = false;

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls canDelete={CANNOT_DO_ACTION} canAnnotate={CANNOT_DO_ACTION} onCreate={onCreate} onCommentClick={onCommentClick} {...props}/>
    </div>
);

const PendingPlainHighlightControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' canAnnotate={CAN_DO_ACTION} />
);

const PlainHighlightControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={CAN_DO_ACTION}  />
);

const DeletablePlainHighlightControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION}
    />
);

const PendingHighlightCommentControls = () => (
    <ActionControlsContainer isPending={IS_PENDING} type='highlight' canAnnotate={CAN_DO_ACTION} />
);

const HighlightCommentControls = () => (
    <ActionControlsContainer type='highlight-comment' canAnnotate={CAN_DO_ACTION} />
);

const DeletableHighlightCommentControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={CAN_DO_ACTION} canDelete={CAN_DO_ACTION}
    />
);


const HighlightControlsExamples = () => (
    <div className='ba'>
        <PendingPlainHighlightControls />
        <PlainHighlightControls />
        <DeletablePlainHighlightControls />
        <PendingHighlightCommentControls />
        <HighlightCommentControls />
        <DeletableHighlightCommentControls />
    </div>
);

export default HighlightControlsExamples;