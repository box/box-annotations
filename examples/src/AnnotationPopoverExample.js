import React from 'react';

import AnnotationPopover from 'box-annotations/lib/components/AnnotationPopover';

const USER1 = {
    type: 'user',
    id: '123abc',
    name: 'Dominic Toretto',
    email: 'fast@furious.com'
};

const USER2 = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const createdAt = '2017-08-27T10:40:41-07:00';
const IS_TRUE = true;

const onDelete = () => console.log('annotation deleted');
const onCreate = ({ text }) => console.log(`annotation created with '${text}'`);
const onCancel = () => console.log('annotation canceled');

const annotations = [
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
        isPending: IS_TRUE
    }
];

const AnnotationPopoverContainer = (props) => (
    <div className='annotation-container'>
        <AnnotationPopover onDelete={onDelete} onCancel={onCancel} onCreate={onCreate} {...props} />
    </div>
);

const ListPopover = () => (
    <AnnotationPopoverContainer annotations={annotations} canAnnotate={IS_TRUE} />
);

const CreatePopover = () => (
    <AnnotationPopoverContainer canAnnotate={IS_TRUE} />
);

const CannotAnnotatePopover = () => (
    <AnnotationPopoverContainer annotations={annotations} />
);

const AnnotationPopoverExample = () => (
    <div className='ba'>
        <CreatePopover />
        <CannotAnnotatePopover />
        <ListPopover />
    </div>
);

export default AnnotationPopoverExample;