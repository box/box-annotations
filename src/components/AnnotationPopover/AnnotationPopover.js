// @flow
import React from 'react';
import noop from 'lodash/noop';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';
import ApprovalCommentForm from '../../../third-party/components/ApprovalCommentForm';

import Internationalize from '../Internationalize';
import AnnotationList from '../AnnotationList';

import './AnnotationPopover.scss';

type Props = {
    annotations: Annotations,
    canAnnotate: boolean,
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap
};

type State = {
    isInputOpen: boolean
};

const NULL_USER = {};
const IS_EDITING_TRUE = true;

class AnnotationPopover extends React.Component<Props, State> {
    defaultProps = {
        isPending: false
    };

    state = {
        isInputOpen: true
    };

    componentWillMount() {
        this.setState({ isInputOpen: true });
    }

    componentWillUnmount() {
        this.setState({ isInputOpen: false });
    }

    hasAnnotations = () => {
        const { annotations } = this.props;
        return annotations && annotations.length > 0;
    };

    render() {
        const { annotations, canAnnotate, onDelete, onCancel, onCreate, language, messages: intlMessages } = this.props;
        const { isInputOpen } = this.state;
        return (
            <Internationalize language={language} messages={intlMessages}>
                <Overlay className='ba-annotation-popover'>
                    {this.hasAnnotations() && <AnnotationList annotations={annotations} onDelete={onDelete} />}
                    {canAnnotate && (
                        <ApprovalCommentForm
                            className='ba-annotation-input-container'
                            user={NULL_USER}
                            isOpen={isInputOpen}
                            isEditing={IS_EDITING_TRUE}
                            createComment={onCreate}
                            onCancel={onCancel}
                            onSubmit={noop}
                            onFocus={noop}
                            getAvatarUrl={noop}
                        />
                    )}
                </Overlay>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
