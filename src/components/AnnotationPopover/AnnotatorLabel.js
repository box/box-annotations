// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import CommentText from '../../../third-party/components/Comment/CommentText';

import { isHighlightAnnotation, isDrawingAnnotation } from '../../util';
import messages from './messages';

import './AnnotatorLabel.scss';

type Props = {
    id?: string,
    type: AnnotationType,
    createdBy: ?User,
    isPending: boolean,
    intl: any
};

class AnnotatorLabel extends React.PureComponent<Props> {
    /**
     * Return a string describes the action completed by the annotator
     * @return {string} Localized annotator label message
     */
    getAnnotatorLabelMessage(): string {
        const { type, createdBy, intl } = this.props;
        const anonymousUserName = intl.formatMessage(messages.anonymousUserName);
        const name = get(createdBy, 'name', anonymousUserName);

        let labelMessage = messages.whoAnnotated;
        if (isHighlightAnnotation(type)) {
            labelMessage = messages.whoHighlighted;
        } else if (isDrawingAnnotation(type)) {
            labelMessage = messages.whoDrew;
        }

        return intl.formatMessage(labelMessage, { name });
    }

    render() {
        const { id, isPending } = this.props;
        return (
            !isPending && (
                <span className='ba-annotation-label'>
                    <CommentText id={id} tagged_message={this.getAnnotatorLabelMessage()} translationEnabled={false} />
                </span>
            )
        );
    }
}

export default injectIntl(AnnotatorLabel);
