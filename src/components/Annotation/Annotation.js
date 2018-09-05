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
import withFocus from '../withFocus';
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
    error?: ActionItemError,
    className: string,
    onBlur: Function,
    onFocus: Function
};

class Annotation extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        onDelete: noop
    };

    render() {
        const {
            id,
            isPending,
            error,
            createdAt,
            createdBy,
            permissions,
            message,
            onDelete,
            className,
            onBlur,
            onFocus
        } = this.props;

        const canDelete = getProp(permissions, 'can_delete', false);
        const hasDeletePermission = onDelete && canDelete && !isPending;
        const hasKnownAnnotator = createdBy && createdBy.name;

        const createdAtTimestamp = new Date(createdAt).getTime();
        const annotator = {
            id:
                // $FlowFixMe
                hasKnownAnnotator ? createdBy.id : '0',
            name: hasKnownAnnotator ? (
                // $FlowFixMe
                createdBy.name
            ) : (
                <FormattedMessage className='ba-annotation-user-name' {...messages.anonymousUserName} />
            )
        };

        return (
            <div
                className={classNames(`ba-annotation ${className}`, {
                    'ba-is-pending': isPending || error
                })}
                onBlur={onBlur}
                onFocus={onFocus}
            >
                <div className='ba-annotation-content'>
                    <Avatar className='ba-annotation-avatar' {...createdBy} />
                    <div className='ba-annotation-text'>
                        <div className='ba-annotation-headline'>
                            <UserLink className='ba-annotation-user-name' {...annotator} />
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
                            {hasDeletePermission ? (
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

export { Annotation as AnnotationComponent };
export default withFocus(Annotation);
