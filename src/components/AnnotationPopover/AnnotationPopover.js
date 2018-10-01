// @flow
import React from 'react';
import classNames from 'classnames';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';
import AnnotatorLabel from './AnnotatorLabel';

type Props = {
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap
} & Annotation;

const AnnotationPopover = ({
    id,
    type,
    createdAt,
    createdBy,
    comments,
    canAnnotate,
    isPending,
    canDelete,
    onDelete,
    onCancel,
    onCreate,
    language,
    messages: intlMessages
}: Props) => (
    <Internationalize language={language} messages={intlMessages}>
        <Overlay
            className={classNames('ba-annotation-popover', {
                'ba-inline': !isPending && !comments
            })}
        >
            {comments ? (
                <CommentList comments={comments} onDelete={onDelete} />
            ) : (
                <AnnotatorLabel id={id} type={type} createdBy={createdBy} isPending={isPending} />
            )}
            {canAnnotate && (
                <ActionControls
                    type={type}
                    isPending={isPending}
                    canDelete={canDelete}
                    createdBy={createdBy}
                    createdAt={createdAt}
                    onCreate={onCreate}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            )}
        </Overlay>
    </Internationalize>
);

AnnotationPopover.defaultProps = {
    isPending: false,
    canAnnotate: false,
    canDelete: false
};

export default AnnotationPopover;
