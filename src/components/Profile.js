//  @flow
import * as React from 'react';
import Avatar from 'box-react-ui/lib/components/avatar/Avatar';
import * as constants from '../constants';

type Props = {
    user: User,
    createdBy: Date
};

const Profile = ({ user, createdBy }: Props): React.Node => (
    <div>
        <Avatar
            id={user.id}
            name={user.name}
            avatarUrl={user.avatarUrl}
            className={constants.CLASS_PROFILE_IMG_CONTAINER}
        />
        <div className={constants.CLASS_PROFILE_CONTAINE}>
            <div className={constants.CLASS_USER_NAME}> {user.name} </div>
            <div className={constants.CLASS_COMMENT_DATE}> {createdBy} </div>
        </div>
    </div>
);

export default Profile;
