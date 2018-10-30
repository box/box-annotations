import React from 'react';

/* eslint-disable-next-line */
import CommentList from 'box-annotations/lib/components/CommentList';

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

const USER3 = {
    type: 'user',
    id: '8',
    name: 'Brian O\'Conner',
    email: '2fast@furious.com'
};

const createdAt = '2017-08-27T10:40:41-07:00';
const modifiedAt = '2017-08-27T10:40:41-07:00';

const error = {
    action: {
        onAction: () => {},
        text: 'This does things'
    },
    message: { id: '123', defaultMessage: 'Something happened' },
    title: { id: '456', defaultMessage: 'Uh Oh!' }
}

const onDelete = () => {};

const comments = [
    {
        id: '123def',
        createdAt,
        modifiedAt,
        createdBy: USER1,
        message: 'FAMILY',
        permissions: {},
        onDelete
    },
    {
        id: '456def',
        createdAt,
        modifiedAt,
        createdBy: USER2,
        message: 'I\'m a princess?',
        permissions: {},
        onDelete,
        isPending: true
    },
    {
        id: '789ghi',
        createdAt,
        modifiedAt,
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
        modifiedAt,
        message: 'Knock? Knock?',
        permissions: {}
    },
    {
        id: '654fed',
        createdAt,
        modifiedAt,
        createdBy: USER3,
        message: 'WHOOPS!',
        permissions: {},
        onDelete,
        error
    }
];

const CommentListExamples = () => (
    <div className='ba'>
        <CommentList comments={comments} onDelete={onDelete} />
    </div>
);

export default CommentListExamples;