// @flow
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Overlay from 'box-react-ui/lib/components/flyout/Overlay';
import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconClose from 'box-react-ui/lib/icons/general/IconClose';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';
import { TYPES } from '../../constants';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';
import AnnotatorLabel from './AnnotatorLabel';

type Props = {
    isMobile: boolean,
    canComment: boolean,
    position: Function,
    onDelete: Function,
    onCancel: Function,
    onCreate: Function,
    onCommentClick: Function,
    isPending: boolean,
    language?: string,
    messages?: StringMap,
    headerHeight?: number
} & Annotation;

class AnnotationPopover extends React.PureComponent<Props> {
    static defaultProps = {
        isMobile: false,
        isPending: false,
        canAnnotate: false,
        canComment: false,
        canDelete: false,
        onCommentClick: noop,
        onDelete: noop,
        onCancel: noop,
        onCreate: noop,
        comments: []
    };

    componentDidMount() {
        const { position } = this.props;
        position();
    }

    render() {
        const {
            id,
            type,
            createdAt,
            createdBy,
            comments,
            isMobile,
            canComment,
            canAnnotate,
            isPending,
            canDelete,
            onDelete,
            onCancel,
            onCreate,
            onCommentClick,
            language,
            messages: intlMessages,
            headerHeight
        } = this.props;
        const hasComments = comments.length > 0;
        const isInline = !hasComments && (type === TYPES.highlight || type === TYPES.draw);

        return (
            <Internationalize language={language} messages={intlMessages}>
                <div
                    className={classNames('ba-popover', {
                        'ba-inline': isInline,
                        'ba-animate-popover': isMobile,
                        'ba-create-popover': isPending
                    })}
                >
                    {isMobile ? (
                        <span className='ba-mobile-header' style={{ height: headerHeight }}>
                            <PlainButton className='ba-mobile-close-btn' onClick={onCancel}>
                                <IconClose height={24} width={24} />
                            </PlainButton>
                        </span>
                    ) : (
                        <span className='ba-popover-caret' />
                    )}

                    <Overlay className='ba-popover-overlay'>
                        {hasComments ? (
                            <CommentList comments={comments} onDelete={onDelete} />
                        ) : (
                            <AnnotatorLabel id={id} type={type} createdBy={createdBy} isPending={isPending} />
                        )}
                        {canAnnotate && (
                            <ActionControls
                                id={id}
                                type={type}
                                hasComments={hasComments}
                                isPending={isPending}
                                canComment={canComment}
                                canDelete={canDelete}
                                createdBy={createdBy}
                                createdAt={createdAt}
                                onCreate={onCreate}
                                onCancel={onCancel}
                                onDelete={onDelete}
                                onCommentClick={onCommentClick}
                            />
                        )}
                    </Overlay>
                </div>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
