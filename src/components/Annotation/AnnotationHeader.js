// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import getProp from 'lodash/get';

import InlineDelete from '../../../third-party/components/Comment/InlineDelete';
import UserLink from '../../../third-party/components/Comment/UserLink';
import Timestamp from './Timestamp';
import messages from './messages';

import './AnnotationHeader.scss';

const ANONYMOUS_USER = {
    id: '0',
    name: <FormattedMessage className='ba-annotation-user-name' {...messages.anonymousUserName} />
};

type Props = {
    id: string,
    permissions: AnnotationPermissions,
    createdAt?: string,
    createdBy?: User,
    onDelete?: Function,
    isPending: boolean
};

const AnnotationHeader = ({ id, permissions, onDelete, createdAt, createdBy, isPending }: Props) => {
    const canDelete = getProp(permissions, 'can_delete', false);
    const hasDeletePermission = onDelete && canDelete && !isPending;

    const annotator = !!createdBy && !!createdBy.name ? createdBy : ANONYMOUS_USER;

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

export default AnnotationHeader;
