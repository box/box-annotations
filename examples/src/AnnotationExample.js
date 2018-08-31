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
    id: '456def',
    name: 'Brian O\'Conner',
    email: '2fast@furious.com'
};

const USER3 = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const DATE = '2017-08-27T10:40:41-07:00';
const PENDING_TRUE = true;

const onDelete = () => console.log('annotation deleted');

const AnnotationContainer = (props) => (
    <Annotation {...props} />
);

const ActiveAnnotation = () => (
    <AnnotationContainer
        id='123def'
        created_at={DATE}
        created_by={USER1}
        message='FAMILY'
        permissions={{}}
        onDelete={onDelete}
    />
);

const PendingAnnotation = () => (
    <AnnotationContainer
        id='456def'
        created_at={DATE}
        created_by={USER2}
        message={'I\'m not a cop'}
        isPending={PENDING_TRUE}
        permissions={{}}
    />
);

const DeletableAnnotation = () => (
    <AnnotationContainer
        id='789ghi'
        created_at={DATE}
        created_by={USER3}
        message={'I\'m a princess?'}
        permissions={{
            can_delete: true
        }}
        onDelete={onDelete}
    />
);

const AnnnotationExamples = () => (
    <div className='ba'>
        <ActiveAnnotation />
        <PendingAnnotation />
        <DeletableAnnotation />
    </div>
);

AnnnotationExamples.displayName = 'AnnotationExamples';

export default AnnnotationExamples;