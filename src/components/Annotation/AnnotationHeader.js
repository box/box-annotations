// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import getProp from 'lodash/get';

import InlineDelete from '../../../third-party/components/Comment/InlineDelete';
import UserLink from '../../../third-party/components/Comment/UserLink';
import Timestamp from './Timestamp';
import messages from './messages';

import './AnnotationHeader.scss';

type Props = {
    id: string,
    permissions: AnnotationPermissions,
    createdAt?: string,
    createdBy?: User,
    onDelete?: Function,
    isPending: boolean,
    intl: any
};

const AnnotationHeader = ({ id, permissions, onDelete, createdAt, createdBy, isPending, intl }: Props) => {
    const canDelete = getProp(permissions, 'can_delete', false);
    const hasDeletePermission = onDelete && canDelete && !isPending;

    const anonymousUser = {
        id: '0',
        name: intl.formatMessage(messages.anonymousUserName)
    };

    const annotator = !!createdBy && !!createdBy.name ? createdBy : anonymousUser;

    return (
        <div className='ba-annotation-headline'>
            <UserLink className='ba-annotation-user-name' id={annotator.id} name={annotator.name} />
            {createdAt && <Timestamp time={createdAt} />}
            {hasDeletePermission && (
                <InlineDelete
                    id={id}
                    permissions={permissions}
                    message={<FormattedMessage {...messages.annotationDeletePrompt} />}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default injectIntl(AnnotationHeader);
