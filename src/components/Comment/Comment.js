// @flow
import * as React from 'react';
import noop from 'lodash/noop';

import CommentComponent from '../../../third-party/components/Comment';

import { PLACEHOLDER_USER } from '../../constants';

type Props = {
    id: string,
    message: string,
    createdAt: string,
    createdBy?: User,
    modifiedAt?: string,
    permissions: AnnotationPermissions,
    onDelete: Function,
    isPending: boolean,
    error?: ActionItemError
};

class Comment extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        permissions: {
            can_delete: false,
            can_edit: false
        },
        onDelete: noop
    };

    render() {
        const { id, isPending, error, createdAt, modifiedAt, message, onDelete, permissions, createdBy } = this.props;
        return (
            <CommentComponent
                id={id}
                currentUser={PLACEHOLDER_USER}
                onDelete={onDelete}
                created_at={createdAt}
                created_by={createdBy}
                modified_at={modifiedAt}
                tagged_message={message}
                permissions={{ ...permissions }}
                isEditing={false}
                isPending={isPending}
                error={error}
            />
        );
    }
}

export default Comment;
