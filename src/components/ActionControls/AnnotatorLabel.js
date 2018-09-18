// @flow
import React from 'react';
import { injectIntl } from 'react-intl';

import CommentText from '../../../third-party/components/Comment/CommentText';

import { TYPES } from '../../constants';
import { isHighlightAnnotation } from '../../util';

import messages from './messages';

import './ActionControls.scss';

type Props = {
    id: string,
    type: AnnotationType,
    currentUser?: User,
    intl: any
};

class AnnotatorLabel extends React.PureComponent<Props> {
    getAnnotationLabel() {
        const { type, currentUser, intl } = this.props;
        const anonymousUserName = intl.formatMessage(messages.anonymousUserName);
        const annotatorName = !!currentUser && !!currentUser.name ? currentUser.name : anonymousUserName;

        if (isHighlightAnnotation(type)) {
            return intl.formatMessage(messages.whoHighlighted, { name: annotatorName });
        }

        if (type === TYPES.draw) {
            return intl.formatMessage(messages.whoDrew, { name: annotatorName });
        }

        return intl.formatMessage(messages.whoAnnotated, { name: annotatorName });
    }

    render() {
        const { id } = this.props;
        const annotatorLabelMessage = this.getAnnotationLabel();

        return (
            <span className='ba-annotation-label'>
                <CommentText id={id} tagged_message={annotatorLabelMessage} translationEnabled={false} />
            </span>
        );
    }
}

export default injectIntl(AnnotatorLabel);
