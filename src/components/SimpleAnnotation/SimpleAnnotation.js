// @flow
import React from 'react';
import noop from 'lodash/noop';

import AnnotatorLabel from './AnnotatorLabel';
import ActionControls from '../ActionControls';

import './SimpleAnnotation.scss';

type Props = {
    id: string,
    type: AnnotationType,
    canDelete: boolean,
    canAnnotate: boolean,
    canComment: boolean,
    onCreate: Function,
    onCommentClick: Function,
    onDelete: Function,
    isPending: boolean,
    createdBy: ?User
};

const SimpleAnnotation = ({
    id,
    type,
    canDelete,
    canAnnotate,
    canComment,
    onCreate,
    onCommentClick,
    onDelete,
    isPending,
    createdBy
}: Props) => {
    return (
        <span className='ba-annotation-simple'>
            {!isPending && <AnnotatorLabel id={id} type={type} createdBy={createdBy} />}
            <ActionControls
                type={type}
                canDelete={canDelete}
                canAnnotate={canAnnotate}
                canComment={canComment}
                isPending={isPending}
                onCreate={onCreate}
                onCommentClick={onCommentClick}
                onDelete={onDelete}
            />
        </span>
    );
};

SimpleAnnotation.defaultProps = {
    canAnnotate: false,
    canDelete: false,
    canComment: false,
    isPending: false,
    onCommentCick: noop
};

export default SimpleAnnotation;
