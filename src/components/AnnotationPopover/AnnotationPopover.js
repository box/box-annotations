// @flow
import React from 'react';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';

import Internationalize from '../Internationalize';
import AnnotationList from '../AnnotationList';
import AnnotationForm from '../AnnotationForm';

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

class AnnotationPopover extends React.Component<Props> {
    defaultProps = {
        isPending: false
    };

    hasAnnotations = () => {
        const { annotations } = this.props;
        return annotations && annotations.length > 0;
    };

    render() {
        const { annotations, canAnnotate, onDelete, onCancel, onCreate, language, messages: intlMessages } = this.props;
        return (
            <Internationalize language={language} messages={intlMessages}>
                <Overlay className='ba-annotation-popover'>
                    {this.hasAnnotations() && <AnnotationList annotations={annotations} onDelete={onDelete} />}
                    {canAnnotate && <AnnotationForm onCreate={onCreate} onCancel={onCancel} />}
                </Overlay>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
