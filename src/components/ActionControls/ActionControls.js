// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import getProp from 'lodash/get';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';
import IconClose from 'box-react-ui/lib/icons/general/IconClose';

import { TYPES } from '../../constants';
import { isHighlightAnnotation } from '../../util';
import Internationalize from '../Internationalize';

import './ActionControls.scss';
import AnnotatorLabel from './AnnotatorLabel';

type Props = {
    id: string,
    type: AnnotationType,
    canDelete: boolean,
    canAnnotate: boolean,
    onCreate: Function,
    onCommentClick: Function,
    isPending: boolean,
    currentUser?: User,
    language?: string,
    messages?: StringMap,
    intl: any
};

const ActionControls = ({
    id,
    type,
    canDelete,
    canAnnotate,
    onCreate,
    onCommentClick,
    isPending,
    currentUser,
    language,
    messages: intlMessages
}: Props) => {
    const isHighlight = isHighlightAnnotation(type);
    const isDrawing = type === TYPES.draw;
    const canComment = isHighlight && canAnnotate;

    return (
        <Internationalize language={language} messages={intlMessages}>
            <div className='ba-action-controls'>
                {!isPending && <AnnotatorLabel id={id} type={type} currentUser={currentUser} />}
                {!!(isHighlight && canDelete) && (
                    <PlainButton type='button' className='ba-highlight-btn' onClick={onCreate}>
                        <IconHighlightAnnotation />
                    </PlainButton>
                )}
                {canComment && (
                    <PlainButton type='button' className='ba-highlight-comment-btn' onClick={onCommentClick}>
                        <IconHighlightCommentAnnotation />
                    </PlainButton>
                )}
                {!!(isDrawing && canDelete) && (
                    <PlainButton type='button' className='ba-drawing-delete-btn' onClick={onCommentClick}>
                        <IconClose />
                    </PlainButton>
                )}
            </div>
        </Internationalize>
    );
};

export default injectIntl(ActionControls);
