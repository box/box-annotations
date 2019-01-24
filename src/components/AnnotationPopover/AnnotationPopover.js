// @flow
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconClose from 'box-react-ui/lib/icons/general/IconClose';
import { HotkeyRecord, HotkeyLayer } from 'box-react-ui/lib/components/hotkeys';

import Internationalize from '../Internationalize';
import CommentList from '../CommentList';
import { TYPES, CLASS_ANNOTATION_POPOVER, CLASS_ANNOTATION_CARET } from '../../constants';

import './AnnotationPopover.scss';
import ActionControls from '../ActionControls';
import AnnotatorLabel from './AnnotatorLabel';

const CLASS_INLINE_POPOVER = 'ba-inline-popover';
const CLASS_ANIMATE_POPOVER = 'ba-animate-popover';
const CLASS_CREATE_POPOVER = 'ba-create-popover';
const CLASS_MOBILE_HEADER = 'ba-mobile-header';
const CLASS_MOBILE_CLOSE_BTN = 'ba-mobile-close-btn';
const CLASS_POPOVER_OVERLAY = 'ba-popover-overlay';

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
        onCreate: noop,
        comments: []
    };

    componentDidMount() {
        const { position } = this.props;
        position();
    }

    componentDidUpdate() {
        const { position } = this.props;
        position();
    }

    getHotkeyConfigs() {
        const { onCancel } = this.props;
        return [
            new HotkeyRecord({
                description: 'Close popover',
                key: 'esc',
                handler: onCancel,
                type: 'Close'
            })
        ];
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
                <HotkeyLayer configs={this.getHotkeyConfigs()}>
                    <div
                        className={classNames(CLASS_ANNOTATION_POPOVER, {
                            [CLASS_INLINE_POPOVER]: isInline,
                            [CLASS_ANIMATE_POPOVER]: isMobile,
                            [CLASS_CREATE_POPOVER]: isPending
                        })}
                    >
                        {isMobile ? (
                            <span className={CLASS_MOBILE_HEADER} style={{ height: headerHeight }}>
                                <PlainButton className={CLASS_MOBILE_CLOSE_BTN} onClick={onCancel}>
                                    <IconClose height={20} width={20} />
                                </PlainButton>
                            </span>
                        ) : (
                            <span className={CLASS_ANNOTATION_CARET} />
                        )}
                        <div className={CLASS_POPOVER_OVERLAY}>
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
                        </div>
                    </div>
                </HotkeyLayer>
            </Internationalize>
        );
    }
}

export default AnnotationPopover;
