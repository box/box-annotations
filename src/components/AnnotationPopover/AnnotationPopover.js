// @flow
import React from 'react';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';

type Props = {
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap
} & Annotation;

class AnnotationPopover extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        canAnnotate: false,
        canDelete: false
    };

    hasAnnotationComments = () => {
        const { comments } = this.props;
        return comments && comments.length > 0;
    };

    render() {
        const {
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
        } = this.props;
        return (
            <Internationalize language={language} messages={intlMessages}>
                <Overlay className='ba-annotation-popover'>
                    {this.hasAnnotationComments() ? <CommentList comments={comments} onDelete={onDelete} /> : <div /> // Annotator label
                    }
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
    }
}

export default AnnotationPopover;
