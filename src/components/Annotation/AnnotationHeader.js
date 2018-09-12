// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import InlineDelete from '../../../third-party/components/InlineDelete';
import UserLink from '../../../third-party/components/UserLink';
import Timestamp from './Timestamp';
import messages from './messages';

import './AnnotationHeader.scss';

type Props = {
    id: string,
    permissions: AnnotationPermissions,
    createdAt?: string,
    createdBy?: User,
    onDelete?: Function
};

const AnnotationHeader = ({ id, permissions, onDelete, createdAt, createdBy }: Props) => {
    const annotator =
        !!createdBy && !!createdBy.name
            ? createdBy
            : {
                id: '0',
                name: <FormattedMessage className='ba-annotation-user-name' {...messages.anonymousUserName} />
            };

    return (
        <div className='ba-annotation-headline'>
            <UserLink className='ba-annotation-user-name' id={annotator.id} name={annotator.name} />
            {createdAt && <Timestamp time={createdAt} />}
            {onDelete && (
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
