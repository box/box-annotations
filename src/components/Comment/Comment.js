// @flow
import * as React from 'react';
import noop from 'lodash/noop';

import CommentComponent from '../../../third-party/components/Comment';

import { PLACEHOLDER_USER } from '../../constants';

type Props = {
    error?: ActionItemError,
    onDelete: Function,
} & CommentProps;

class Comment extends React.PureComponent<Props> {
    static defaultProps = {
        isPending: false,
        permissions: {
            can_delete: false,
            can_edit: false,
        },
        onDelete: noop,
    };

    render() {
        const { id, isPending, error, createdAt, modifiedAt, message, onDelete, permissions, createdBy } = this.props;
        return (
            <CommentComponent
                created_at={createdAt}
                created_by={createdBy}
                currentUser={PLACEHOLDER_USER}
                error={error}
                id={id}
                isEditing={false}
                isPending={isPending}
                modified_at={modifiedAt}
                onDelete={onDelete}
                permissions={{ ...permissions }}
                tagged_message={message}
            />
        );
    }
}

export default Comment;
