import React from 'react';

/* eslint-disable-next-line */
import ActionControls from 'box-annotations/lib/components/ActionControls';

const onCreate = () => {};
const onCommentClick = () => {};

const ActionControlsContainer = (props) => (
    <div className='action-controls-container'>
        <ActionControls canAnnotate={false} canDelete={false} canComment={false} onCreate={onCreate} onCommentClick={onCommentClick} {...props}/>
    </div>
);

const PendingPlainHighlightControls = () => (
    <ActionControlsContainer isPending={true} type='highlight' canAnnotate={true} />
);

const PlainHighlightControls = () => (
    <ActionControlsContainer type='highlight' canAnnotate={true}  />
);

const PendingHighlightCommentControls = () => (
    <ActionControlsContainer isPending={true} type='highlight' canAnnotate={true} canComment={true} />
);

const HighlightCommentControls = () => (
    <ActionControlsContainer type='highlight-comment' canAnnotate={true} canComment={true} />
);


const HighlightControlsExamples = () => (
    <div className='ba'>
        <PendingPlainHighlightControls />
        <PlainHighlightControls />
        <PendingHighlightCommentControls />
        <HighlightCommentControls />
    </div>
);

export default HighlightControlsExamples;