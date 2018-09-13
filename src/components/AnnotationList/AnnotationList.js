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
            {annotations.map(({ id, ...rest }) => (
                <li className='ba-annotation-list-item' key={`annotation_${id}`}>
                    <Annotation id={id} onDelete={onDelete} {...rest} />
                </li>
            ))}
        </ul>
    </Internationalize>
);

export default AnnotationList;
