// @flow
import React from 'react';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';
import Internationalize from '../Internationalize';
import withFocus from '../withFocus';

import './AnnotationForm.scss';

type Props = {
    onCreate: Function,
    onCancel: Function,
    language?: string,
    messages?: StringMap,
    placeholderText?: string
};

type State = {
    isOpen: boolean
};

const DUMMY_USER = {};
const IS_EDITING = true;

class AnnotationForm extends React.Component<Props, State> {
    state = {
        isOpen: true
    };

    componentWillMount() {
        this.setState({ isOpen: true });
    }

    componentWillUnmount() {
        this.setState({ isOpen: false });
    }

    render() {
        const { onCreate, onCancel, placeholderText, language, messages: intlMessages } = this.props;
        const { isOpen } = this.state;

        return (
            <Internationalize language={language} messages={intlMessages}>
                <ApprovalCommentForm
                    className='ba-annotation-input-container'
                    user={DUMMY_USER}
                    isOpen={isOpen}
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
    }
}

export { AnnotationForm as AnnotationFormComponent };
export default withFocus(AnnotationForm);
