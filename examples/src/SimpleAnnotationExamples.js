import React from 'react';

import SimpleAnnotation from 'box-annotations/lib/components/SimpleAnnotation';

const onDelete = () => console.log('deleted');
const onCreate = () => console.log('saved');
const USER = {
    id: '123',
    name: 'Sumedha Pramod'
};

const SimpleAnnotationContainer = (props) => (
    <div className='simple-annotation-container'>
        <SimpleAnnotation canDelete={false} canAnnotate={false} onDelete={onDelete} onCreate={onCreate} {...props}/>
    </div>
);

const AnonymousDrawAnnotation = () => (
    <SimpleAnnotationContainer type='draw' canAnnotate={true} canDelete={true} />
);

const AnonymousPlainHighlightAnnotation = () => (
    <SimpleAnnotationContainer type='highlight' canAnnotate={true} canDelete={true} />
);

const AnonymousHighlightCommentAnnotation = () => (
    <SimpleAnnotationContainer type='highlight-comment' canAnnotate={true} canDelete={true} canComment={true} />
);

const DrawAnnotation = () => (
    <SimpleAnnotationContainer type='draw' canAnnotate={true} canDelete={true} user={USER} />
);

const PlainHighlightAnnotation = () => (
    <SimpleAnnotationContainer type='highlight' canAnnotate={true} canDelete={true} user={USER} />
);

const HighlightCommentAnnotation = () => (
    <SimpleAnnotationContainer type='highlight-comment' canAnnotate={true} canDelete={true} canComment={true} user={USER} />
);

const SimpleAnnotationExamples = () => (
    <div className='ba'>
        <AnonymousDrawAnnotation />
        <AnonymousPlainHighlightAnnotation />
        <AnonymousHighlightCommentAnnotation />
        <DrawAnnotation />
        <PlainHighlightAnnotation />
        <HighlightCommentAnnotation />
    </div>
);

export default SimpleAnnotationExamples;