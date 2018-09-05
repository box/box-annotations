// @flow
import * as React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import getProp from 'lodash/get';
import noop from 'lodash/noop';

import Avatar from 'box-react-ui/lib/components/avatar';
import { ReadableTime } from 'box-react-ui/lib/components/time';
import Tooltip from 'box-react-ui/lib/components/tooltip';

import CommentText from '../../../third-party/components/CommentText';
import InlineDelete from '../../../third-party/components/InlineDelete';
import CommentInlineError from '../../../third-party/components/CommentInlineError';
import UserLink from '../../../third-party/components/UserLink';
import messages from './messages';

import './Annotation.scss';

const ONE_HOUR_MS = 3600000; // 60 * 60 * 1000

type Props = {
    id: string,
    message: string,
    permissions: AnnotationPermissions,
    createdAt: string,
    createdBy?: User,
    modifiedAt?: string,
    onDelete?: Function,
    isPending?: boolean,
    error?: ActionItemError
};

type State = {
    isFocused?: boolean
};

class Annotation extends React.Component<Props, State> {
    static defaultProps = {
        isPending: false,
        onDelete: noop
    };

    state = {
        isFocused: false
    };

    onKeyDown = (event: SyntheticKeyboardEvent<>): void => {
        const { nativeEvent } = event;
        nativeEvent.stopImmediatePropagation();
    };

    handleAnnotationFocus = (): void => {
        this.setState({ isFocused: true });
    };

    handleAnnotationBlur = (): void => {
        this.setState({ isFocused: false });
    };

    render() {
        const { id, createdAt, createdBy, permissions, message, isPending, error, onDelete } = this.props;
        const { isFocused } = this.state;
        const canDelete = getProp(permissions, 'can_delete', false);
        const createdAtTimestamp = new Date(createdAt).getTime();

        const annotator = {
            id: createdBy && createdBy.name ? createdBy.id : '0',
            name:
                createdBy && createdBy.name ? (
                    createdBy.name
                ) : (
                    <FormattedMessage className='ba-annotation-user-name' {...messages.anonymousUserName} />
                )
        };

        return (
            <div
                className={classNames('ba-annotation', {
                    'ba-is-pending': isPending || error,
                    'ba-is-focused': isFocused
                })}
                onBlur={this.handleAnnotationBlur}
                onFocus={this.handleAnnotationFocus}
            >
                <div className='ba-annotation-content'>
                    <Avatar className='ba-annotation-avatar' {...createdBy} />
                    <div className='ba-annotation-text'>
                        <div className='ba-annotation-headline'>
                            <UserLink className='ba-annotation-user-name' id={annotator.id} name={annotator.name} />
                            <Tooltip
                                text={
                                    <FormattedMessage
                                        {...messages.annotationPostedFullDateTime}
                                        values={{ time: createdAtTimestamp }}
                                    />
                                }
                            >
                                <time className='ba-annotation-created-at'>
                                    <ReadableTime timestamp={createdAtTimestamp} relativeThreshold={ONE_HOUR_MS} />
                                </time>
                            </Tooltip>
                            {onDelete && canDelete && !isPending ? (
                                <InlineDelete
                                    id={id}
                                    permissions={permissions}
                                    message={<FormattedMessage {...messages.annotationDeletePrompt} />}
                                    onDelete={onDelete}
                                />
                            ) : null}
                        </div>
                        <CommentText id={id} tagged_message={message} translationEnabled={false} />
                    </div>
                </div>
                {error ? <CommentInlineError {...error} /> : null}
            </div>
        );
    }
}

export default Annotation;
