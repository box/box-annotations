// @flow
import React from 'react';

import Internationalize from '../Internationalize';

// import './SimpleAnnotation.scss';
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
    user?: User,
    language?: string,
    messages?: StringMap,
    intl: any
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
    user,
    language,
    messages: intlMessages
}: Props) => {
    return (
        <Internationalize language={language} messages={intlMessages}>
            <div className='ba-annotation-simple'>
                {!isPending && <AnnotatorLabel id={id} type={type} user={user} />}
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
            </div>
        </Internationalize>
    );
};

export default SimpleAnnotation;
