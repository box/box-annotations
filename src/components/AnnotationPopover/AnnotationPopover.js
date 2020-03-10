// @flow
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { HotkeyRecord, HotkeyLayer } from 'box-ui-elements/es/components/hotkeys';

import messages from './messages';
import CommentList from '../CommentList';
import { TYPES, CLASS_ANNOTATION_POPOVER, CLASS_ANNOTATION_CARET } from '../../constants';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';
import AnnotatorLabel from './AnnotatorLabel';

const CLASS_INLINE_POPOVER = 'ba-inline-popover';
const CLASS_CREATE_POPOVER = 'ba-create-popover';
const CLASS_POPOVER_OVERLAY = 'ba-popover-overlay';

type Props = {
    canComment: boolean,
    intl: Object,
    isPending: boolean,
    language?: string,
    messages?: StringMap,
    onCancel: Function,
    onCommentClick: Function,
    onCreate: Function,
    onDelete: Function,
    position: Function,
} & Annotation;

class AnnotationPopover extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        canAnnotate: false,
        canComment: false,
        canDelete: false,
        onCommentClick: noop,
        onDelete: noop,
        onCreate: noop,
        comments: [],
    };

    componentDidMount() {
        const { position } = this.props;
        position();
    }

    componentDidUpdate() {
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
            intl,
            canComment,
            canAnnotate,
            isPending,
            canDelete,
            onDelete,
            onCancel,
            onCreate,
            onCommentClick,
        } = this.props;
        const hasComments = comments.length > 0;
        const isInline = !hasComments && (type === TYPES.highlight || type === TYPES.draw);
        const configs = [
            new HotkeyRecord({
                description: <FormattedMessage {...messages.close} />,
                key: 'esc',
                handler: onCancel,
                type: 'Close',
            }),
        ];

        return (
            <RawIntlProvider value={intl}>
                <HotkeyLayer configs={configs}>
                    <div
                        className={classNames(CLASS_ANNOTATION_POPOVER, {
                            [CLASS_INLINE_POPOVER]: isInline,
                            [CLASS_CREATE_POPOVER]: isPending,
                        })}
                    >
                        <span className={CLASS_ANNOTATION_CARET} />
                        <div className={CLASS_POPOVER_OVERLAY}>
                            {hasComments ? (
                                <CommentList comments={comments} onDelete={onDelete} />
                            ) : (
                                <AnnotatorLabel createdBy={createdBy} id={id} isPending={isPending} type={type} />
                            )}
                            {canAnnotate && (
                                <ActionControls
                                    canComment={canComment}
                                    canDelete={canDelete}
                                    createdAt={createdAt}
                                    createdBy={createdBy}
                                    hasComments={hasComments}
                                    id={id}
                                    isPending={isPending}
                                    onCancel={onCancel}
                                    onCommentClick={onCommentClick}
                                    onCreate={onCreate}
                                    onDelete={onDelete}
                                    type={type}
                                />
                            )}
                        </div>
                    </div>
                </HotkeyLayer>
            </RawIntlProvider>
        );
    }
}

export default AnnotationPopover;
