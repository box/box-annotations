// @flow
import React from 'react';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';
import Internationalize from '../Internationalize';
import withFocus from '../withFocus';

type Props = {
    onCreate: Function,
    onCancel: Function,
    language?: string,
    messages?: StringMap,
    placeholderText?: string
};

const DUMMY_USER = {};
const IS_EDITING = true;
const KEEP_INPUT_OPEN = true;

const AnnotationForm = ({ onCreate, onCancel, placeholderText, language, messages: intlMessages }: Props) => (
    <Internationalize language={language} messages={intlMessages}>
        <ApprovalCommentForm
            className='ba-annotation-input-container'
            user={DUMMY_USER}
            isOpen={KEEP_INPUT_OPEN}
            isEditing={IS_EDITING}
            createComment={onCreate}
            onCancel={onCancel}
            onSubmit={noop}
            onFocus={noop}
            getAvatarUrl={noop}
            tagged_message={placeholderText}
        />
    </Internationalize>
);

export { AnnotationForm as AnnotationFormComponent };
export default withFocus(AnnotationForm);
