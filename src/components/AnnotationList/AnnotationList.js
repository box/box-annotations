// @flow
import React from 'react';

import Internationalize from '../Internationalize';
import Annotation from '../Annotation';

import './AnnotationList.scss';

type Props = {
    annotations: Annotations,
    language?: string,
    messages?: StringMap,
    onDelete: Function
};

const AnnotationList = ({ annotations, language, messages: intlMessages, onDelete }: Props) => (
    <Internationalize language={language} messages={intlMessages}>
        <ul className='ba-annotation-list'>
            {annotations.map((annotation) => (
                <li className='ba-annotation-list-item' key={`annotation_${annotation.id}`}>
                    <Annotation {...annotation} onDelete={onDelete} />
                </li>
            ))}
        </ul>
    </Internationalize>
);

export default AnnotationList;
