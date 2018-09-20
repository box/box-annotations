import React from 'react';

/* eslint-disable-next-line */
import AnnotationForm from 'box-annotations/lib/components/AnnotationForm';

const onCreate = () => {};
const onCancel = () => {};

const AnnotationFormExample = () => (
    <div className='ba'>
        <AnnotationForm onCreate={onCreate} onCancel={onCancel} />
    </div>
);

export default AnnotationFormExample;