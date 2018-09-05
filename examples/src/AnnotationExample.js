import React from 'react';

import Annotation from 'box-annotations/lib/components/Annotation';

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

const DATE = '2017-08-27T10:40:41-07:00';
const PENDING_TRUE = true;

const ERROR = {
    action: {
        onAction: () => console.log('action'),
        text: 'This does things'
    },
    message: { id: '123', defaultMessage: 'Something happened' },
    title: { id: '456', defaultMessage: 'Uh Oh!' }
}

const onDelete = () => console.log('annotation deleted');

const AnnotationContainer = (props) => (
    <Annotation {...props} />
);

const ActiveAnnotation = () => (
    <AnnotationContainer
        id='123def'
        createdAt={DATE}
        createdBy={USER1}
        message='FAMILY'
        permissions={{}}
        onDelete={onDelete}
    />
);

const PendingAnnotation = () => (
    <AnnotationContainer
        id='456def'
        createdAt={DATE}
        createdBy={USER2}
        message={'I\'m a princess?'}
        isPending={PENDING_TRUE}
    />
);

const DeletableAnnotation = () => (
    <AnnotationContainer
        id='789ghi'
        createdAt={DATE}
        createdBy={USER3}
        message={'I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! I\'m not a cop! '}
        permissions={{
            can_delete: true
        }}
        onDelete={onDelete}
    />
);

const AnonymousAnnotation = () => (
    <AnnotationContainer
        id='321cba'
        createdAt={DATE}
        message='Knock? Knock?'
        permissions={{}}
    />
);

const ErrorAnnotation = () => (
    <AnnotationContainer
        id='654fed'
        createdAt={DATE}
        createdBy={USER3}
        message='WHOOPS!'
        permissions={{}}
        error={ERROR}
    />
);

const AnnnotationExamples = () => (
    <div className='ba'>
        <ActiveAnnotation />
        <PendingAnnotation />
        <DeletableAnnotation />
        <AnonymousAnnotation />
        <ErrorAnnotation />
    </div>
);

AnnnotationExamples.displayName = 'AnnotationExamples';

export default AnnnotationExamples;