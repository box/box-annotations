// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import CommentText from '../../../third-party/components/Comment/CommentText';

import { isHighlightAnnotation, isDrawingAnnotation } from '../../util';
import messages from './messages';

import './AnnotatorLabel.scss';

const CLASS_ANNOTATOR_LABEL = 'ba-annotator-label';

type Props = {
    createdBy: ?User,
    id?: string,
    intl: any,
    isPending: boolean,
    type: AnnotationType,
};

const AnnotatorLabel = ({ id, isPending, type, createdBy, intl }: Props) => {
    if (isPending) {
        return null;
    }

    const anonymousUserName = intl.formatMessage(messages.anonymousUserName);
    const name = get(createdBy, 'name', anonymousUserName);

    let labelMessage = messages.whoAnnotated;
    if (isHighlightAnnotation(type)) {
        labelMessage = messages.whoHighlighted;
    } else if (isDrawingAnnotation(type)) {
        labelMessage = messages.whoDrew;
    }

    return (
        <span className={CLASS_ANNOTATOR_LABEL}>
            <CommentText
                id={id}
                tagged_message={intl.formatMessage(labelMessage, { name })}
                translationEnabled={false}
            />
        </span>
    );
};

export default injectIntl(AnnotatorLabel);
