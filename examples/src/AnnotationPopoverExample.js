import React from 'react';

/* eslint-disable-next-line */
import AnnotationPopover from 'box-annotations/lib/components/AnnotationPopover';

const USER1 = {
    type: 'user',
    id: '1',
    name: 'Dominic Toretto',
    email: 'fast@furious.com'
};

const USER2 = {
    type: 'user',
    id: '4',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const createdAt = '2017-08-27T10:40:41-07:00';

const onDelete = () => {};
const onCreate = () => {};
const onCancel = () => {};

const comments = [
    {
        id: '123def',
        createdAt,
        createdBy: USER1,
        message: 'FAMILY',
        permissions: {
            can_delete: true
        },
        onDelete
    },
    {
        id: '456def',
        createdAt,
        createdBy: USER2,
        message: 'I\'m a princess?',
        permissions: {},
        onDelete,
        isPending: true
    },
    {
        id: '789ghi',
        createdAt,
        createdBy: USER1,
        message: 'WASSUP',
        permissions: {
            can_delete: true
        },
        onDelete
    }
];

const AnnotationPopoverContainer = (props) => (
    <div className='annotation-container'>
        <AnnotationPopover type='point' isPending={false} onDelete={onDelete} onCancel={onCancel} onCreate={onCreate} {...props} />
    </div>
);

const ListPopover = () => (
    <AnnotationPopoverContainer comments={comments} canAnnotate={true} />
);

const PointCreatePopover = () => (
    <AnnotationPopoverContainer isPending={true} canAnnotate={true} canDelete={true} />
);

const HighlightCreatePopover = () => (
    <AnnotationPopoverContainer type='highlight' isPending={true} canAnnotate={true} canDelete={true} />
);

const HighlightCommentCreatePopover = () => (
    <AnnotationPopoverContainer type='highlight-comment' isPending={true} canAnnotate={true} canDelete={true} />
);

const DrawCreatePopover = () => (
    <AnnotationPopoverContainer type='draw' isPending={true} canAnnotate={true} canDelete={true} />
);

const CannotAnnotatePopover = () => (
    <AnnotationPopoverContainer comments={comments} />
);

const PlainHighlightAnnotation = () => (
    <AnnotationPopoverContainer type='highlight' isPending={false} canAnnotate={true} canDelete={true} />
);

const HighlightCommentAnnotation = () => (
    <AnnotationPopoverContainer type='highlight-comment' isPending={false} canAnnotate={true} canDelete={true} />
);

const DrawingAnnotation = () => (
    <AnnotationPopoverContainer type='draw' isPending={false} canAnnotate={true} canDelete={true} />
);

const AnnotationPopoverExample = () => (
    <div className='ba'>
        <PointCreatePopover />
        <HighlightCreatePopover />
        <HighlightCommentCreatePopover />
        <DrawCreatePopover />
        <CannotAnnotatePopover />
        <ListPopover />
        <PlainHighlightAnnotation />
        <HighlightCommentAnnotation />
        <DrawingAnnotation />
    </div>
);

export default AnnotationPopoverExample;