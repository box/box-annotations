import React from 'react';

/* eslint-disable-next-line */
import ActionControls from 'box-annotations/lib/components/ActionControls';

const onCreate = () => {};
const onCommentClick = () => {};

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls canDelete={false} canAnnotate={false} onCreate={onCreate} onCommentClick={onCommentClick} {...props}/>
    </div>
);

const PendingPlainHighlightControls = () => (
    <ActionControlsContainer isPending={true} type='highlight' canAnnotate={true} />
);

const PlainHighlightControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={true}  />
);

const DeletablePlainHighlightControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={true} canDelete={true}
    />
);

const PendingHighlightCommentControls = () => (
    <ActionControlsContainer isPending={true} type='highlight' canAnnotate={true} />
);

const HighlightCommentControls = () => (
    <ActionControlsContainer type='highlight-comment' canAnnotate={true} />
);

const DeletableHighlightCommentControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={true} canDelete={true}
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