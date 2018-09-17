import React from 'react';

import AnnotationForm from 'box-annotations/lib/components/AnnotationForm';

const onCreate = ({ text }) => console.log(`annotation created with '${text}'`);
const onCancel = () => console.log('annotation canceled');

const AnnotationFormExample = () => (
    <div className='ba'>
        <AnnotationForm onCreate={onCreate} onCancel={onCancel} />
    </div>
);

AnnotationFormExample.displayName = 'AnnotationForm';

export default AnnotationFormExample;