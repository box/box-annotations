import React from 'react';

import AnnotationList from 'box-annotations/lib/components/AnnotationList';

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

const USER3 = {
    type: 'user',
    id: '456def',
    name: 'Brian O\'Conner',
    email: '2fast@furious.com'
};

const createdAt = '2017-08-27T10:40:41-07:00';
const PENDING_TRUE = true;

const error = {
    action: {
        onAction: () => console.log('action'),
        text: 'This does things'
    },
    message: { id: '123', defaultMessage: 'Something happened' },
    title: { id: '456', defaultMessage: 'Uh Oh!' }
}

const onDelete = () => console.log('annotation deleted');

const annotations = [
    {
        id: '123def',
        createdAt,
        createdBy: USER1,
        message: 'FAMILY',
        permissions: {},
        onDelete
    },
    {
        id: '456def',
        createdAt,
        createdBy: USER2,
        message: 'I\'m a princess?',
        permissions: {},
        onDelete,
        isPending: PENDING_TRUE
    },
    {
        id: '789ghi',
        createdAt,
        createdBy: USER3,
        message: 'I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! ',
        permissions: {
            can_delete: true
        },
        onDelete
    },
    {
        id: '321cba',
        createdAt,
        message: 'Knock? Knock?',
        permissions: {}
    },
    {
        id: '654fed',
        createdAt,
        createdBy: USER3,
        message: 'WHOOPS!',
        permissions: {},
        onDelete,
        error
    }
];

const AnnotationListExamples = () => (
    <div className='ba'>
        <AnnotationList annotations={annotations} onDelete={onDelete} />
    </div>
);

AnnotationListExamples.displayName = 'AnnotationListExamples';

export default AnnotationListExamples;